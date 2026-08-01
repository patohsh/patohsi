function unlockPayment() {
    const paymentSection = document.getElementById('paymentReveal');
    if (!paymentSection) {
        return;
    }

    paymentSection.classList.remove('is-hidden');
    paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
