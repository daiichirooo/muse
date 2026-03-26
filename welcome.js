document.addEventListener('DOMContentLoaded', function() {
    const wordsContainer = document.querySelector('.words-container');
    const musicWord = document.getElementById('music-word');
    const browseWord = document.getElementById('browse-word');
    const museContainer = document.querySelector('.muse-container');
    const spinningChar = document.getElementById('spinning-char');
    const mainContent = document.querySelector('.main-content');
    const welcomeContainer = document.querySelector('.welcome-container');
    const diveInBtn = document.getElementById('diveInBtn');

    const headline = document.querySelector('.headline');
    const description = document.querySelector('.description');

    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const wait = ms => new Promise(r => setTimeout(r, ms));

    function startSpinning() {
    return new Promise((resolve) => {
        let currentSpeed = 30;
        let charIndex = 0;

        function spin() {
        charIndex = (charIndex + 1) % characters.length;
        spinningChar.textContent = characters[charIndex];

        if (currentSpeed > 150 && characters[charIndex] === 'e') {
            spinningChar.textContent = 'e';
            resolve();
            return;
        }

        currentSpeed = Math.min(currentSpeed * 1.12, 160);
        setTimeout(spin, currentSpeed);
        }

        setTimeout(spin, currentSpeed);
    });
    }


    diveInBtn.addEventListener('click', function() {
        window.location.href = 'menu.html';
    });

    async function startAnimation() {
    await wait(350);
    musicWord.classList.add('visible');


    await wait(600);
    browseWord.classList.add('visible');


    await wait(1600);
    musicWord.classList.add('fade-out');
    browseWord.classList.add('fade-out');
    museContainer.classList.add('visible', 'left-position');


    await startSpinning();


    await wait(700);

    museContainer.style.transition = 'left 600ms cubic-bezier(.2,.9,.2,1), transform 600ms cubic-bezier(.2,.9,.2,1), opacity 300ms ease-out';
    museContainer.classList.remove('left-position');
    museContainer.classList.add('center-position');


    await wait(3400);
    const exitDuration = 3200; 
    const timingFunc = 'cubic-bezier(.2,.9,.2,1)';

    museContainer.style.transition = `transform ${exitDuration}ms ${timingFunc}, opacity ${exitDuration}ms ease-out`;
    mainContent.style.transition = `transform ${exitDuration}ms ${timingFunc}`;
    if (headline) headline.style.transition = `transform ${exitDuration}ms ${timingFunc}, opacity ${exitDuration}ms ease-out`;
    if (description) description.style.transition = `transform ${exitDuration}ms ${timingFunc}, opacity ${exitDuration}ms ease-out`;

    requestAnimationFrame(() => {
        museContainer.classList.add('exit');

        headline && headline.classList.add('enter');
        description && description.classList.add('enter');
        mainContent.classList.add('visible');
    });


    await wait(exitDuration + 200);
    welcomeContainer.style.display = 'none';


    await wait(2500);
    diveInBtn.classList.add('visible');
    }

    startAnimation();
});