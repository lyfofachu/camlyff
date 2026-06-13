/* ================================================
   script.js — CAMLYFF Supplemental Scripts
   ================================================
   Main logic lives in index.html inline scripts.
   This file provides lightweight helpers only.
*/

/* Smooth scroll fallback for older browsers */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});