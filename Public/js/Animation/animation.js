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
    
    observer.observe(paragraph);
  });
}


function onClickAnimation(elementClassName, animationClassName) {
  document.querySelectorAll(`.${elementClassName}`).forEach((element) => {
    element.addEventListener("click", function () {
      element.classList.add(animationClassName);

      // Remove the animation class after the animation completes to allow replay on next click
      setTimeout(() => {
        element.classList.remove(animationClassName);
      }, 1000); // Match the animation duration
    });
  });
}

function onHoverAnimation(elementClassName, animationClassName) {
  document.querySelectorAll(`.${elementClassName}`).forEach((element) => {
    element.addEventListener("mouseover", function () {
      element.classList.add(animationClassName);
    });

    element.addEventListener("mouseleave", function () {
      // Optionally remove the class when hover ends
      setTimeout(() => {
        element.classList.remove(animationClassName);
      }, 1000); // Match the animation duration
    });
  });
}