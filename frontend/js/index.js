let selectedOption = null;

function selectOption(card, option) {
    // Remove selected class from all cards
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    
    // Add selected class to clicked card
    card.classList.add('selected');
    
    // Store selected option
    selectedOption = option;
    
    // Enable proceed button
    const proceedBtn = document.querySelector('.proceed-button');
    proceedBtn.classList.add('active');
}

function proceedToMap() {
    if (!selectedOption) {
        alert('Please select a monitoring option first!');
        return;
    }
    
    // Navigate to different pages based on selected option
    switch(selectedOption) {
        case 'heatmap':
            window.location.href = 'heatmap.html';
            break;
        case 'regional':
            window.location.href = 'regional.html';
            break;
        case 'comparison':
            window.location.href = 'comparison.html';
            break;
        default:
            alert('Invalid option selected!');
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});