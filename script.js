/* PRELOADER */

window.addEventListener("load", function(){

const preloader = document.getElementById("preloader");

preloader.style.opacity = "0";

setTimeout(() => {
preloader.style.display = "none";
}, 600);

});


/* FADE IN SCROLL ANIMATION */

const faders = document.querySelectorAll('.fade-in');

const appearOnScroll = new IntersectionObserver(entries => {

entries.forEach(entry => {

if(entry.isIntersecting){
entry.target.classList.add('visible');
}

});

});

faders.forEach(fader => {
appearOnScroll.observe(fader);
});

/* SCROLL PROGRESS BAR */

window.addEventListener("scroll", function(){

let scrollTop = document.documentElement.scrollTop;
let scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

let scrollPercent = (scrollTop / scrollHeight) * 100;

document.getElementById("progress-bar").style.width = scrollPercent + "%";

});

function logout(){
firebase.auth().signOut();
window.location.href="login.html";
}
const firebaseConfig = {
apiKey: "...",
authDomain: "...",
projectId: "...",
};