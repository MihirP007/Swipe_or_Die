async function create_group(username) {
    try {
        const response = await fetch('http://127.0.0.1:5001/create_group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        });

        if (!response.ok) {
            console.error('Server error while creating group:', response.status, await response.text());
            return false;
        }

        const res = await response.json();
        console.log(res.message); // e.g., "Group created successfully" or includes group_code
        // If the server sends back the group code, you can use it:
        // if (res.group_code) { alert(`Group created! Code: ${res.group_code}`); }
        return res.message === "Group created successfully"; // Adjust if server response changes
    } catch (error) {
        console.error('Fetch error during create_group:', error);
        return false;
    }
}

async function join_group(username, party_code_str) {
    try {
        const party_code_num = Number(party_code_str);
        // Client-side validation (also done in modal, but good for direct calls too)
        if (party_code_str.length !== 5 || isNaN(party_code_num)) {
            console.error("Invalid party code format/length in join_group function.");
            // For the modal, it's better to throw an error or return a specific message
            // that can be displayed to the user. For now, returning false.
            return { success: false, message: "Invalid party code: Must be 5 digits." };
        }

        const response = await fetch('http://127.0.0.1:5001/join_group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, party_code: party_code_num })
        });

        const res = await response.json(); // Try to parse JSON regardless of response.ok

        if (!response.ok) {
            console.error('Server error while joining group:', response.status, res.error || 'Unknown server error');
            return { success: false, message: res.error || `Server error: ${response.status}` };
        }
        
        if (res.message === "Joined group successfully" || res.message === "User already in group") {
            return { success: true, message: res.message };
        } else {
            // This case might not be reached if !response.ok covers server errors
            console.error('Failed to join group:', res.error || res.message);
            return { success: false, message: res.error || res.message || "Failed to join group." };
        }
    } catch (error) {
        console.error('Fetch error during join_group:', error);
        return { success: false, message: "Network error or could not connect to server." };
    }
}

function handleCreateGroup() {
    const username = sessionStorage.getItem('username');
    const createButton = document.querySelectorAll(".action-button")[1]; // Assuming it's the second

    if (!username) {
        alert("Please log in to create a group.");
        console.error("Username not found in sessionStorage for create group.");
        return;
    }

    if (createButton) {
        createButton.disabled = true;
        createButton.textContent = "CREATING...";
    }

    create_group(username).then((success) => {
        if (success) {
            console.log("Group created successfully.");
            alert("Group created successfully! You might be redirected or given a group code.");
            // Potentially handle redirect or display code here
        } else {
            console.error("Failed to create group.");
            alert("Failed to create group. Please try again.");
        }
    }).finally(() => {
        if (createButton) {
            createButton.disabled = false;
            createButton.textContent = "CREATE GROUP";
        }
    });
    console.log("CREATE GROUP button clicked");
}

function handleMenuToggle() {
    const hamburger = document.querySelector('.hamburger-menu');
    if (hamburger) {
        hamburger.classList.toggle('active');
        console.log("Hamburger menu toggled via home_logic.js");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // --- MODAL ELEMENTS ---
    const modalOverlay = document.getElementById("modalOverlay");
    const groupCodeInput = document.getElementById("groupCodeInput");
    const modalJoinButton = document.getElementById("modalJoinButton");
    const modalCloseButton = document.getElementById("modalCloseButton");
    const modalErrorMessage = document.getElementById("modalErrorMessage");

    // --- MODAL FUNCTIONS ---
    function openModal() {
        if (modalOverlay && groupCodeInput && modalErrorMessage) {
            groupCodeInput.value = ""; // Clear previous input
            modalErrorMessage.textContent = ""; // Clear previous error message
            modalErrorMessage.style.color = "var(--error-red)"; // Reset to error color
            modalOverlay.style.display = "flex";
            document.body.classList.add("modal-open");
            groupCodeInput.focus(); // Focus on the input field
        } else {
            console.error("Modal elements not found. Cannot open modal.");
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.style.display = "none";
            document.body.classList.remove("modal-open");
        }
    }

    // --- PAGE BUTTONS & MENU EVENT LISTENERS ---
    const actionButtons = document.querySelectorAll(".action-button:not(.modal-action-button)"); // Exclude modal button
    const menuIcon = document.querySelector(".hamburger-menu");

    if (actionButtons.length > 0 && actionButtons[0]) {
        const pageJoinGroupButton = actionButtons[0]; // "JOIN GROUP" button on the page
        pageJoinGroupButton.addEventListener("click", (event) => {
            event.preventDefault();
            const username = sessionStorage.getItem('username');
            if (!username) {
                alert("Please log in to join a group.");
                console.error("Username not found in sessionStorage. Cannot open join modal.");
                return;
            }
            console.log("Page JOIN GROUP button clicked - opening modal");
            openModal();
        });
    }

    if (actionButtons.length > 1 && actionButtons[1]) {
        const createGroupButton = actionButtons[1]; // "CREATE GROUP" button on the page
        createGroupButton.addEventListener("click", handleCreateGroup);
    }

    if (menuIcon) {
        menuIcon.addEventListener("click", handleMenuToggle);
    }

    // --- MODAL EVENT LISTENERS ---
    if (modalJoinButton) {
        modalJoinButton.addEventListener("click", async () => {
            const username = sessionStorage.getItem('username'); // Should be present if modal is open
            const code = groupCodeInput.value.trim();
            modalErrorMessage.textContent = ""; // Clear previous error

            if (!username) { // Should ideally not happen due to pre-check
                modalErrorMessage.textContent = "Error: User session not found. Please refresh and log in.";
                return;
            }

            if (!code || code.length !== 5 || !/^\d{5}$/.test(code)) { // Regex for 5 digits
                modalErrorMessage.textContent = "Please enter a valid 5-digit code.";
                groupCodeInput.focus();
                return;
            }
            
            modalJoinButton.disabled = true;
            modalJoinButton.textContent = "JOINING...";

            try {
                const result = await join_group(username, code);
                if (result.success) {
                    console.log("Successfully joined the group:", result.message);
                    modalErrorMessage.textContent = result.message + "! Redirecting soon...";
                    modalErrorMessage.style.color = "var(--primary-green)"; // Success color
                    
                    setTimeout(() => {
                        closeModal();
                        // Example: window.location.href = '/group-lobby/' + code; // Redirect to group lobby
                    }, 2000); // Delay for user to read message
                } else {
                    modalErrorMessage.textContent = result.message || "Failed to join group. Please check the code or try again.";
                    modalErrorMessage.style.color = "var(--error-red)";
                    console.error("Failed to join the group (modal handler):", result.message);
                    modalJoinButton.disabled = false; // Re-enable only on error
                    modalJoinButton.textContent = "JOIN";
                }
            } catch (error) { // Should be caught by join_group's catch, but as a fallback
                console.error("Unexpected error during join_group call from modal:", error);
                modalErrorMessage.textContent = "An unexpected error occurred. Please try again.";
                modalErrorMessage.style.color = "var(--error-red)";
                modalJoinButton.disabled = false; // Re-enable only on error
                modalJoinButton.textContent = "JOIN";
            }
            // Do not re-enable button here if successful, as it will close.
        });
    }

    if (modalCloseButton) {
        modalCloseButton.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        // Close modal if user clicks on the overlay (outside the modal content)
        modalOverlay.addEventListener("click", (event) => {
            if (event.target === modalOverlay) { // Check if the click is directly on the overlay
                closeModal();
            }
        });
    }
});