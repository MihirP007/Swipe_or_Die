document.addEventListener('DOMContentLoaded', () => {
    // --- TITLE ANIMATION ---
    const swipeTitleElement = document.querySelector('.swipe-title');
    if (swipeTitleElement && swipeTitleElement.getAttribute('data-text')) {
        const text = swipeTitleElement.getAttribute('data-text');
        swipeTitleElement.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.transitionDelay = `${i * 0.08}s`;
            swipeTitleElement.appendChild(span);
        });
        setTimeout(() => {
            swipeTitleElement.querySelectorAll('span').forEach(span => {
                span.classList.add('visible');
            });
        }, 100);
    }

    // --- DOM ELEMENTS ---
    const swipeCard = document.getElementById('swipeCard');
    const swipeLeftButton = document.getElementById('swipeLeftButton');
    const swipeRightButton = document.getElementById('swipeRightButton');
    const noMoreCardsMessage = document.getElementById('noMoreCardsMessage');
    const swipeCardStack = document.querySelector('.swipe-card-stack');
    const actionButtonsContainer = document.querySelector('.swipe-actions');
    const cardThumbnail = document.getElementById('cardThumbnail');
    const cardTitle = document.getElementById('cardTitle');
    const cardTitleOverlayElement = document.getElementById('cardTitleOverlayElement');
    const cardReleaseDate = document.getElementById('cardReleaseDate');
    const cardGenre = document.getElementById('cardGenre');
    const cardImdbRating = document.getElementById('cardImdbRating');
    const cardCast = document.getElementById('cardCast');
    const cardSummary = document.getElementById('cardSummary');
    const cardThumbnailContainer = document.getElementById('cardThumbnailContainer');

    // --- MOVIE DATA ---
    const moviesData = [
        {
            id: 1,
            title: "Echoes of Tomorrow",
            year: "2024",
            genre: "Sci-Fi, Thriller",
            imdb: "8.2",
            cast: "Anya Sharma, Ben Carter, Chloe Davis",
            summary: "In a future where memories can be traded, a detective uncovers a conspiracy that challenges the nature of identity itself. Gripping and thought-provoking.",
            thumbnailUrl: "https://picsum.photos/seed/movie1/600/400",
            videoId: "dQw4w9WgXcQ"
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

    // --- CARD POPULATION ---
    function populateCard(movie) {
        if (cardThumbnail) {
            cardThumbnail.src = movie.thumbnailUrl;
            cardThumbnail.alt = movie.title + " thumbnail";
        }
        if (cardTitle) cardTitle.textContent = movie.title;
        if (cardTitleOverlayElement) cardTitleOverlayElement.textContent = movie.title;
        if (cardReleaseDate) cardReleaseDate.textContent = movie.year;
        if (cardGenre) cardGenre.textContent = movie.genre;
        if (cardImdbRating) cardImdbRating.textContent = movie.imdb;
        if (cardCast) cardCast.textContent = movie.cast;
        if (cardSummary) cardSummary.textContent = movie.summary;
        if (cardThumbnailContainer) cardThumbnailContainer.dataset.videoId = movie.videoId;
    }

    // --- SHOW NEXT CARD ---
    function showNextCard() {
        if (!swipeCard) return;
        swipeCard.classList.remove('swiping-left', 'swiping-right', 'show-feedback-left', 'show-feedback-right', 'reacting-left', 'reacting-right', 'details-visible');
        swipeCard.style.transform = '';
        swipeCard.style.opacity = '';

        if (currentCardIndex < moviesData.length) {
            const movie = moviesData[currentCardIndex];
            populateCard(movie);
            swipeCard.classList.add('new-card-prepare');
            if (swipeCard.style.display === 'none') swipeCard.style.display = 'flex';
            requestAnimationFrame(() => {
                setTimeout(() => {
                    swipeCard.classList.remove('new-card-prepare');
                }, 50);
            });
        } else {
            swipeCard.style.display = 'none';
            actionButtonsContainer.style.display = 'none';
            if (noMoreCardsMessage) {
                noMoreCardsMessage.style.display = 'block';
                setTimeout(() => noMoreCardsMessage.classList.add('visible'), 50);
            }
            console.log("No more cards!");
            console.log("Final Liked Movies:", likedMovies.map(m => m.title));
            console.log("Final Disliked Movies:", dislikedMovies.map(m => m.title));
        }
    }

    // --- HANDLE SWIPE ACTION ---
    function handleSwipeAction(direction) {
        if (!swipeCard || currentCardIndex >= moviesData.length) return;
        const movie = moviesData[currentCardIndex];
        const cardReactionTime = 150;
        const cardSwipeTime = 600;

        if (direction === 'left') {
            dislikedMovies.push(movie);
            swipeCard.classList.add('show-feedback-left', 'reacting-left');
            setTimeout(() => {
                swipeCard.classList.remove('reacting-left');
                swipeCard.classList.add('swiping-left');
            }, cardReactionTime);
        } else {
            likedMovies.push(movie);
            swipeCard.classList.add('show-feedback-right', 'reacting-right');
            setTimeout(() => {
                swipeCard.classList.remove('reacting-right');
                swipeCard.classList.add('swiping-right');
            }, cardReactionTime);
        }

        currentCardIndex++;
        setTimeout(showNextCard, cardReactionTime + cardSwipeTime - 100);
    }

    // --- BUTTON EVENTS & INITIAL LOAD ---
    if (swipeLeftButton && swipeRightButton && swipeCard && swipeCardStack && actionButtonsContainer) {
        swipeLeftButton.addEventListener('click', () => handleSwipeAction('left'));
        swipeRightButton.addEventListener('click', () => handleSwipeAction('right'));
        showNextCard();
    } else {
        console.error("Essential swipe UI elements not found. Check IDs and structure in your HTML.");
    }

    // --- VIDEO MODAL LOGIC ---
    const videoModalOverlay = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoPlayer = document.getElementById('videoPlayer');

    if (cardThumbnailContainer && videoModalOverlay && videoPlayer && videoModalClose) {
        cardThumbnailContainer.addEventListener('click', () => {
            const videoId = cardThumbnailContainer.dataset.videoId;
            if (videoId) {
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
                videoModalOverlay.classList.add('active');
                document.body.classList.add('modal-active');
            }
        });

        const closeModal = () => {
            videoModalOverlay.classList.remove('active');
            document.body.classList.remove('modal-active');
            videoPlayer.src = '';
        };

        videoModalClose.addEventListener('click', closeModal);
        videoModalOverlay.addEventListener('click', (e) => {
            if (e.target === videoModalOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && videoModalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }
});