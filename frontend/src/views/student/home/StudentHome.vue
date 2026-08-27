<template>
  <div class="foundation-home">
    <!-- Main Content -->
    <div class="container mt-2 mt-md-4 mb-3 mb-md-5 px-3 px-md-4">
      <!-- Hero Section -->
      <div class="row justify-content-center mb-4 mb-md-5">
        <div class="col-12 col-lg-10">
          <div class="hero-section text-center">
            <h1 class="display-4 display-md-3 fw-bold text-dark mb-2 mb-md-3">Mindstix Foundation Trust</h1>
            <h2 class="h5 h4-md text-secondary mb-3 mb-md-4">Technology Provider For A Social Change</h2>
            <div class="hero-actions">
              <button class="btn btn-outline-dark btn-lg btn-md-lg mb-2" @click="scrollToAbout">
                More About Us
              </button>
            </div>
            <div class="scroll-indicator mt-3 mt-md-4">
              <p class="text-muted small mb-2">Scroll</p>
              <i class="bi bi-chevron-down text-muted animate-bounce"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="row justify-content-center" id="about-section">
        <div class="col-12 col-lg-10">
          <div class="about-section">
            <h3 class="h3 h2-md fw-bold text-dark mb-3 mb-md-4 text-center">Who We Are</h3>
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3 p-md-4 p-lg-5">
                <p class="lead text-justify lh-lg mb-3">
                  Mindstix Foundation Trust is a Pan-India Trust based in Mumbai, Maharashtra. 
                  Primarily, we work for the economically constrained populace of the country 
                  for the upliftment of the society by digital means. We strive for social 
                  transformation and aim to serve the community with the goal of transformation 
                  through digital intervention.
                </p>
                <p class="text-justify lh-lg mb-0">
                  We believe that social transformation can be done on the anvil of technological 
                  growth and development. We leverage all our activities through the use of 
                  existing technology and find ways to upgrade the same with time. We believe 
                  that education and technology are 2 prime fundamental rights that every 
                  citizen deserves to have.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="row justify-content-center mt-4 mt-md-5">
        <div class="col-12 col-lg-10">
          <div class="row g-3 g-md-4">
            <div class="col-12 col-sm-6 col-md-4">
              <div class="card h-100 border-0 shadow-sm text-center">
                <div class="card-body p-3 p-md-4">
                  <div class="icon-circle bg-dark bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-people-fill text-dark"></i>
                  </div>
                  <h5 class="fw-bold mb-2">Social Transformation</h5>
                  <p class="text-muted mb-0">Empowering communities through digital intervention and social change.</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="card h-100 border-0 shadow-sm text-center">
                <div class="card-body p-3 p-md-4">
                  <div class="icon-circle bg-dark bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-laptop text-dark"></i>
                  </div>
                  <h5 class="fw-bold mb-2">Technology Access</h5>
                  <p class="text-muted mb-0">Leveraging technology to bridge the digital divide and create opportunities.</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="card h-100 border-0 shadow-sm text-center">
                <div class="card-body p-3 p-md-4">
                  <div class="icon-circle bg-dark bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-mortarboard-fill text-dark"></i>
                  </div>
                  <h5 class="fw-bold mb-2">Education for All</h5>
                  <p class="text-muted mb-0">Making quality education accessible to every citizen as a fundamental right.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Methods
const scrollToAbout = () => {
  const element = document.getElementById('about-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.foundation-home {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - var(--topbar-height, 56px));
}

.hero-section {
  padding: 3rem 0;
}

.hero-actions .btn {
  min-width: 150px;
  transition: all 0.3s ease;
}

.hero-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-indicator {
  animation: fadeInUp 1s ease-out 0.5s both;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.about-section {
  padding: 2rem 0;
}

.card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.icon-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.text-justify {
  text-align: justify;
}

.lead {
  font-size: 1.1rem;
  font-weight: 400;
}

/* Enhanced responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }
  
  .display-4 {
    font-size: 1.75rem;
    line-height: 1.2;
  }
  
  .hero-actions .btn {
    min-width: 120px;
    margin-bottom: 0.5rem;
    padding: 0.5rem 1rem;
  }
  
  .icon-circle {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .about-section {
    padding: 1.5rem 0;
  }
  
  .lead {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 1.5rem 0;
  }
  
  .display-4 {
    font-size: 1.5rem;
    line-height: 1.3;
  }
  
  .hero-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .hero-actions .btn {
    width: 100%;
    max-width: 200px;
    font-size: 0.9rem;
  }
  
  .icon-circle {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .card-body h5 {
    font-size: 1.1rem;
  }
  
  .card-body p {
    font-size: 0.9rem;
  }
  
  .about-section {
    padding: 1rem 0;
  }
  
  .lead {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 1rem 0;
  }
  
  .display-4 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }
  
  .h5 {
    font-size: 1rem;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .icon-circle {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  .card-body h5 {
    font-size: 1rem;
  }
  
  .card-body p {
    font-size: 0.85rem;
  }
}

/* Utility classes for responsive text sizing */
@media (min-width: 768px) {
  .h4-md {
    font-size: 1.5rem;
  }
  
  .h2-md {
    font-size: 2rem;
  }
  
  .display-md-3 {
    font-size: 2.5rem;
  }
  
  .btn-md-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
  }
}

/* Improved touch targets for mobile */
@media (max-width: 768px) {
  .btn {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  .card {
    margin-bottom: 1rem;
  }
  
  .card:hover {
    transform: none;
  }
}
</style> 