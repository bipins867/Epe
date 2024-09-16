function onLoadAnimation(elementClassName, animationClassName) {
  function handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClassName);
      } else {
        setTimeout(() => {
          entry.target.classList.remove(animationClassName);
        }, 1000);
      }
    });
  }

  // Create an Intersection Observer instance
  const observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.1, // Trigger when 10% of the element is visible
  });

  // Target all paragraphs with 'paragraph' class
  document.querySelectorAll(`.${elementClassName}`).forEach((paragraph) => {
    console.log(elementClassName);
    observer.observe(paragraph);
  });
}
