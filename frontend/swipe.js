document.addEventListener('DOMContentLoaded', () => {
    // Title animation
    const swipeTitleElement = document.querySelector('.swipe-title');
    if (swipeTitleElement && swipeTitleElement.getAttribute('data-text')) {
        const text = swipeTitleElement.getAttribute('data-text');
        swipeTitleElement.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
            span.style.transitionDelay = `${i * 0.08}s`;
            swipeTitleElement.appendChild(span);
        });
        setTimeout(() => {
            swipeTitleElement.querySelectorAll('span').forEach(span => {
                span.classList.add('visible');
            });
        }, 100);
    }

    // --- SWIPE LOGIC ---
    const swipeCard = document.getElementById('swipeCard');
    const swipeLeftButton = document.getElementById('swipeLeftButton');
    const swipeRightButton = document.getElementById('swipeRightButton');
    const noMoreCardsMessage = document.getElementById('noMoreCardsMessage');
    const swipeCardStack = document.querySelector('.swipe-card-stack');
    const actionButtonsContainer = document.querySelector('.swipe-actions');


    // DOM Elements for card content
    const cardThumbnail = document.getElementById('cardThumbnail');
    const cardTitle = document.getElementById('cardTitle');
    const cardReleaseDate = document.getElementById('cardReleaseDate');
    const cardGenre = document.getElementById('cardGenre');
    const cardImdbRating = document.getElementById('cardImdbRating');
    const cardCast = document.getElementById('cardCast');
    const cardSummary = document.getElementById('cardSummary');
    const cardThumbnailContainer = document.getElementById('cardThumbnailContainer');


    // Sample Data - Replace with actual data fetching
    const moviesData = [
        {
            id: 1,
            title: "Echoes of Tomorrow",
            year: "2024",
            genre: "Sci-Fi, Thriller",
            imdb: "8.2",
            cast: "Anya Sharma, Ben Carter, Chloe Davis",
            summary: "In a future where memories can be traded, a detective uncovers a conspiracy that challenges the nature of identity itself. Gripping and thought-provoking.",
            thumbnailUrl: "https://picsum.photos/seed/movie1/600/400", // Placeholder image
            videoId: "dQw4w9WgXcQ" // Sample YouTube video ID
        },
        {
            id: 2,
            title: "The Last Bookseller",
            year: "2023",
            genre: "Drama, Mystery",
            imdb: "7.9",
            cast: "Elias Thorne, Sarah Miller, Ken Watanabe",
            summary: "In a world dominated by digital media, a reclusive owner of the last physical bookstore stumbles upon a coded message hidden in a rare first edition.",
            thumbnailUrl: "https://picsum.photos/seed/movie2/600/400",
            videoId: "L_LUpnjgPso"
        },
        {
            id: 3,
            title: "Green Haven",
            year: "2024",
            genre: "Adventure, Family",
            imdb: "7.5",
            cast: "Lily Green, Tom Forester, Old Willow (voice)",
            summary: "A young girl discovers a hidden, magical garden in her city, protected by ancient spirits, and must save it from urban development.",
            thumbnailUrl: "https://picsum.photos/seed/movie3/600/400",
            videoId: "LXb3EKWsInQ"
        },
        {
            id: 4,
            title: "Cybernetic Serenade",
            year: "2025",
            genre: "Romance, Sci-Fi",
            imdb: "8.5",
            cast: "Eva Unit 7, Adam Connect, Dr. Aris",
            summary: "An advanced AI develops genuine emotions and falls in love with its human programmer, exploring the boundaries of love and consciousness.",
            thumbnailUrl: "https://picsum.photos/seed/movie4/600/400",
            videoId: "3JZ_D3ELwOQ"
        }
    ];

    let currentCardIndex = 0;
    const likedMovies = [];
    const dislikedMovies = [];

    function populateCard(movie) {
        cardThumbnail.src = movie.thumbnailUrl;
        cardThumbnail.alt = movie.title + " thumbnail";
        cardTitle.textContent = movie.title;
        cardReleaseDate.textContent = movie.year;
        cardGenre.textContent = movie.genre;
        cardImdbRating.textContent = movie.imdb;
        cardCast.textContent = movie.cast;
        cardSummary.textContent = movie.summary;

        // Store videoId for modal
        cardThumbnailContainer.dataset.videoId = movie.videoId;
    }

    function showNextCard() {
        if (!swipeCard) return;

        swipeCard.classList.remove('swiping-left', 'swiping-right', 'show-feedback-left', 'show-feedback-right', 'reacting-left', 'reacting-right');
        swipeCard.classList.add('new-card-prepare'); // Prepare for entry animation

        if (currentCardIndex < moviesData.length) {
            const movie = moviesData[currentCardIndex];
            populateCard(movie);
            
            // Animate in the new card
            setTimeout(() => {
                swipeCard.classList.remove('new-card-prepare');
                swipeCard.style.opacity = '1'; // Ensure visible
                swipeCard.style.transform = 'translateY(0) scale(1)'; // Ensure at final position
            }, 50); // Short delay for styles to apply
        } else {
            // No more cards
            swipeCard.style.display = 'none';
            actionButtonsContainer.style.display = 'none';
            if (noMoreCardsMessage) {
                noMoreCardsMessage.style.display = 'block'; // Show the message
                setTimeout(() => noMoreCardsMessage.classList.add('visible'), 50); // Animate in
            }
            console.log("No more cards!");
        }
    }

    function handleSwipeAction(direction) {
        if (!swipeCard || currentCardIndex >= moviesData.length) return;

        const movie = moviesData[currentCardIndex];
        const cardReactionTime = 150; // ms, how long the card "reacts" before swiping
        const cardSwipeTime = 600; // ms, must match CSS --card-swipe-duration

        if (direction === 'left') {
            dislikedMovies.push(movie);
            swipeCard.classList.add('show-feedback-left');
            swipeCard.classList.add('reacting-left');
            setTimeout(() => {
                swipeCard.classList.remove('reacting-left');
                swipeCard.classList.add('swiping-left');
            }, cardReactionTime);
        } else {
            likedMovies.push(movie);
            swipeCard.classList.add('show-feedback-right');
            swipeCard.classList.add('reacting-right');
             setTimeout(() => {
                swipeCard.classList.remove('reacting-right');
                swipeCard.classList.add('swiping-right');
            }, cardReactionTime);
        }

        console.log("Liked:", likedMovies.map(m => m.title));
        console.log("Disliked:", dislikedMovies.map(m => m.title));

        currentCardIndex++;
        setTimeout(showNextCard, cardReactionTime + cardSwipeTime - 100); // Load next card slightly before animation ends
    }

    if (swipeLeftButton && swipeRightButton && swipeCard) {
        swipeLeftButton.addEventListener('click', () => handleSwipeAction('left'));
        swipeRightButton.addEventListener('click', () => handleSwipeAction('right'));
        
        // Initial card load
        showNextCard();
    } else {
        if (!swipeCardStack && moviesData.length > 0) { // If card stack itself is missing, but we have data
            console.error("Swipe card stack or essential card elements not found.");
        }
    }

    // --- VIDEO MODAL LOGIC ---
    const videoModalOverlay = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoPlayer = document.getElementById('videoPlayer');

    if (cardThumbnailContainer && videoModalOverlay && videoPlayer && videoModalClose) {
        cardThumbnailContainer.addEventListener('click', () => {
            const videoId = cardThumbnailContainer.dataset.videoId;
            if (videoId) {
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                videoModalOverlay.classList.add('active');
                document.body.classList.add('modal-active');
            }
        });

        videoModalClose.addEventListener('click', () => {
            videoModalOverlay.classList.remove('active');
            document.body.classList.remove('modal-active');
            videoPlayer.src = ''; // Stop video
        });

        videoModalOverlay.addEventListener('click', (e) => {
            if (e.target === videoModalOverlay) { // Click on overlay itself
                videoModalOverlay.classList.remove('active');
                document.body.classList.remove('modal-active');
                videoPlayer.src = ''; // Stop video
            }
        });
    }
});