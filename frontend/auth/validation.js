console.log('Validation script loaded');
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    async function usernameExists(username){
        const response  = await fetch('http://127.0.0.1:5000/check_username_exists',{
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({username: username})
        });
        if(!response.ok) print('Server error')
        const res = await response.json();
        return res.exists;
    }

    async function registerUser(username,password){
        const response = await fetch("http://127.0.0.1:5000/register",{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password})
        })
        if(!response.ok) print('Server error')
        const res = await response.json();
        if(res.message == "User registered successfully") return true;
        return false;
    }

    async function loginUser(username, password) {
        const response = await fetch('http://127.0.0.1:5000/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password})
        })

        const res = await response.json();
        if(res.message= "Login successful") return true;
        return false;
    }

    function displayError(elementId, message) {
        const errorElement = document.getElementById(elementId + "-error");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block'; 
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(span => {
            span.textContent = '';
            span.style.display = 'none';
        });
    }
    function goToHomePage(username){
        sessionStorage.setItem('username', username);
        window.location.href = '/frontend/landing.html'
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            clearErrors();
            let isValid = true;

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

       
            if (usernameInput.value.trim() === '') {
                displayError('username', 'Username is required.');
                isValid = false;
            }


            if (passwordInput.value.trim() === '') {
                displayError('password', 'Password is required.');
                isValid = false;
            }
            else if (passwordInput.value.length < 6) { // Example: Minimum length
                displayError('password', 'Password must be at least 6 characters.');
                isValid = false;
            }


            if (isValid) {
                let login_result = await loginUser(usernameInput.value.trim(), passwordInput.value.trim());

                if(!login_result){
                    displayError('username', 'Invalid username or password.');
                }
                else{
                    console.log('Login form is valid. Submitting...');
                    goToHomePage(usernameInput.value.trim());
                }
                
            
            } else {
                console.log('Login form has errors.');
            }
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default submission
            clearErrors();
            let isValid = true;

            const fullNameInput = document.getElementById('full_name');
            const signupPasswordInput = document.getElementById('signup_password');
            // const confirmPasswordInput = document.getElementById('confirm_password'); // If you add this
            const termsAgreeCheckbox = document.getElementById('terms_agree');

   
            if (fullNameInput.value.trim() === '') {
                displayError('full_name', 'Full name is required.');
                isValid = false;
            }

            // Password validation (simple: not empty)
            if (signupPasswordInput.value.trim() === '') {
                displayError('signup_password', 'Password is required.');
                isValid = false;
            } else if (signupPasswordInput.value.length < 8) { // Example: Minimum length
                 displayError('signup_password', 'Password must be at least 8 characters.');
                 isValid = false;
            }

            // Confirm Password validation (if you add the field)
            // if (confirmPasswordInput) {
            //     if (confirmPasswordInput.value.trim() === '') {
            //         displayError('confirm_password', 'Please confirm your password.');
            //         isValid = false;
            //     } else if (signupPasswordInput.value !== confirmPasswordInput.value) {
            //         displayError('confirm_password', 'Passwords do not match.');
            //         isValid = false;
            //     }
            // }


            // Terms and Policy checkbox validation
            if (!termsAgreeCheckbox.checked) {
                displayError('terms_agree', 'You must agree to the terms and policy.');
                isValid = false;
            }
            const username_exists = await usernameExists(fullNameInput.value.trim());
            if(username_exists){
                displayError('full_name', 'Username already exists. Please choose another.');
                isValid = false;
            }

            if (isValid) {
                let registration_result = registerUser(fullNameInput.value.trim(), signupPasswordInput.value.trim())
                if(registration_result){
                    goToHomePage(fullNameInput.value.trim());
                    console.log('Signup form is valid. Submitting...'); 
                }
                else{
                    displayError('full_name', 'Registration failed. Please try again.');
                    console.log('Signup form has errors.');
                }
            } else {
                console.log('Signup form has errors.');
            }
        });
    }
});