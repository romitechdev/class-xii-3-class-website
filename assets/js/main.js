document.addEventListener("DOMContentLoaded", function () {
  // Register GSAP Plugins
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Set Current Year in Footer
  const yearElem = document.getElementById("currentYear");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // GSAP HERO ANIMATIONS
  initGSAPHero();

  // GSAP SCROLLTRIGGER ANIMATIONS FOR SECTIONS
  initGSAPScrollTriggers();

  // HERO STATS COUNTER WITH GSAP
  initGSAPStatsCounter();

  // ANGGOTA KELAS (MEMBERS) SEARCH, FILTER & PAGINATION WITH GSAP
  initClassMembers();

  // GALERI WITH GSAP & FANCYBOX
  initGallery();

  // PRESTASI (ACHIEVEMENTS) WITH GSAP
  initAchievements();

  // BACK TO TOP BUTTON & NAVBAR SCROLL STATE
  initScrollEffects();
});

/* -------------------------------------------------------------
 * 1. GSAP HERO ENTRANCE ANIMATION
 * ------------------------------------------------------------- */
function initGSAPHero() {
  if (typeof gsap === "undefined") return;

  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.from(".navbar", {
    y: -80,
    opacity: 0,
    duration: 1,
  })
    .from(
      ".gsap-hero-element",
      {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
      },
      "-=0.5"
    )
    .from(
      ".gsap-hero-title",
      {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 1.2,
      },
      "-=0.8"
    );
}

/* -------------------------------------------------------------
 * 2. GSAP SCROLLTRIGGER SECTION ANIMATIONS
 * ------------------------------------------------------------- */
function initGSAPScrollTriggers() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  // Animate Section Titles
  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  });

  // Animate Social Grid Cards
  gsap.from(".social-card", {
    scrollTrigger: {
      trigger: ".social-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
  });

  // Animate Class Structure Grid
  gsap.from(".structure-card", {
    scrollTrigger: {
      trigger: ".structure-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    scale: 0.95,
    duration: 0.9,
    stagger: 0.12,
    ease: "back.out(1.4)",
  });
}

/* -------------------------------------------------------------
 * 3. GSAP STATS COUNTER
 * ------------------------------------------------------------- */
function initGSAPStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number");
  if (!statNumbers.length || typeof gsap === "undefined") return;

  ScrollTrigger.create({
    trigger: ".stats-container",
    start: "top 80%",
    onEnter: () => {
      statNumbers.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target"), 10);
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: function () {
            counter.innerText = Math.floor(obj.val);
          },
        });
      });
    },
  });
}

/* -------------------------------------------------------------
 * 4. ANGGOTA KELAS (MEMBERS, SEARCH, FILTER, PAGINATION)
 * ------------------------------------------------------------- */
function initClassMembers() {
  const membersContainer = document.getElementById("class-members-container");
  const searchInput = document.getElementById("member-search-input");
  const filterPillsContainer = document.getElementById("filter-pills-container");
  const paginationContainer = document.getElementById("members-pagination");

  if (!membersContainer) return;

  let allMembers = [];
  let filteredMembers = [];
  let currentPage = 1;
  const pageSize = 6;
  let activeFilter = "all";
  let searchQuery = "";

  fetch("./assets/json/members.json")
    .then((res) => res.json())
    .then((data) => {
      allMembers = data;
      applyFilters();
    })
    .catch((err) => console.error("Gagal memuat data anggota:", err));

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      applyFilters();
    });
  }

  // Filter Pills Listener
  if (filterPillsContainer) {
    filterPillsContainer.addEventListener("click", function (e) {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      activeFilter = btn.getAttribute("data-filter") || "all";
      currentPage = 1;
      applyFilters();
    });
  }

  function applyFilters() {
    filteredMembers = allMembers.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery) ||
        m.role.toLowerCase().includes(searchQuery) ||
        (m.description && m.description.toLowerCase().includes(searchQuery));

      if (!matchSearch) return false;
      if (activeFilter === "all") return true;

      const roleLower = m.role.toLowerCase();
      if (activeFilter === "gamer") return roleLower.includes("gamer");
      if (activeFilter === "illustrator")
        return roleLower.includes("illustrator") || roleLower.includes("gambar");
      if (activeFilter === "athlete")
        return (
          roleLower.includes("athlete") ||
          roleLower.includes("taekwondo") ||
          roleLower.includes("player")
        );
      if (activeFilter === "singer")
        return roleLower.includes("singer") || roleLower.includes("music");
      if (activeFilter === "leader")
        return roleLower.includes("leader") || roleLower.includes("ketua");

      return true;
    });

    renderMembersPage(currentPage);
    renderMembersPagination();
  }

  function renderMembersPage(page) {
    membersContainer.innerHTML = "";

    if (filteredMembers.length === 0) {
      membersContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="ri-user-search-line fs-1 text-muted"></i>
            <h5 class="mt-3 text-muted">Tidak ada anggota yang cocok dengan pencarian.</h5>
        </div>`;
      return;
    }

    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, filteredMembers.length);
    const pageItems = filteredMembers.slice(start, end);

    pageItems.forEach((member) => {
      const cardHTML = `
        <div class="col-md-6 col-lg-4 member-item-col">
          <div class="member-card-modern">
            <div>
              <div class="member-card-top">
                <img src="${member.image}" alt="${member.name}" class="member-card-avatar" onerror="this.src='./assets/images/icon1.png';">
                <div class="member-card-info">
                  <h5>${member.name}</h5>
                  <span class="role-tag">${member.role}</span>
                </div>
              </div>
              <p class="member-card-bio">${member.description || "Anggota kelas XII-3."}</p>
            </div>
          </div>
        </div>`;
      membersContainer.insertAdjacentHTML("beforeend", cardHTML);
    });

    // GSAP Stagger Entrance for Members
    if (typeof gsap !== "undefined") {
      gsap.from(".member-item-col", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });
    }
  }

  function renderMembersPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(filteredMembers.length / pageSize);
    if (totalPages <= 1) return;

    // Previous
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#"><i class="ri-arrow-left-s-line"></i></a>`;
    prevLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderMembersPage(currentPage);
        renderMembersPagination();
        scrollToSection("#class-members");
      }
    });
    paginationContainer.appendChild(prevLi);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement("li");
      pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
      pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageLi.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderMembersPage(currentPage);
        renderMembersPagination();
        scrollToSection("#class-members");
      });
      paginationContainer.appendChild(pageLi);
    }

    // Next
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#"><i class="ri-arrow-right-s-line"></i></a>`;
    nextLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderMembersPage(currentPage);
        renderMembersPagination();
        scrollToSection("#class-members");
      }
    });
    paginationContainer.appendChild(nextLi);
  }
}

/* -------------------------------------------------------------
 * 5. GALERI (WITH FANCYBOX LIGHTBOX & GSAP ANIMATIONS)
 * ------------------------------------------------------------- */
function initGallery() {
  const galleryRow = document.getElementById("dynamic-gallery-row");
  const galleryPagination = document.getElementById("pagination-gallery");
  if (!galleryRow) return;

  let galleryItems = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  fetch("./assets/json/gallery.json")
    .then((res) => res.json())
    .then((data) => {
      galleryItems = data;
      renderGalleryPage(currentPage);
      renderGalleryPagination();
    })
    .catch((err) => console.error("Gagal memuat galeri:", err));

  function renderGalleryPage(page) {
    galleryRow.innerHTML = "";
    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, galleryItems.length);
    const pageItems = galleryItems.slice(start, end);

    pageItems.forEach((item) => {
      const html = `
        <div class="col-sm-6 col-md-4 gallery-col-item">
          <div class="gallery-card-modern">
            <div class="gallery-img-wrapper">
              <img src="${item.src}" alt="${item.alt || 'Galeri Infinithree'}" loading="lazy">
              <div class="gallery-overlay">
                <span class="text-white fw-bold fs-6">${item.alt || 'Dokumentasi Momen'}</span>
                <a href="${item.src}" data-fancybox="gallery" data-caption="${item.alt || 'Galeri Infinithree'}" class="gallery-btn-zoom" aria-label="Zoom Photo">
                  <i class="ri-zoom-in-line"></i>
                </a>
              </div>
            </div>
          </div>
        </div>`;
      galleryRow.insertAdjacentHTML("beforeend", html);
    });

    if (typeof Fancybox !== "undefined") {
      Fancybox.bind('[data-fancybox="gallery"]', {});
    }

    if (typeof gsap !== "undefined") {
      gsap.from(".gallery-col-item", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }

  function renderGalleryPagination() {
    if (!galleryPagination) return;
    galleryPagination.innerHTML = "";

    const totalPages = Math.ceil(galleryItems.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Previous
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#"><i class="ri-arrow-left-s-line"></i></a>`;
    prevLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderGalleryPage(currentPage);
        renderGalleryPagination();
        scrollToSection("#gallery");
      }
    });
    galleryPagination.appendChild(prevLi);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement("li");
      pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
      pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageLi.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderGalleryPage(currentPage);
        renderGalleryPagination();
        scrollToSection("#gallery");
      });
      galleryPagination.appendChild(pageLi);
    }

    // Next
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#"><i class="ri-arrow-right-s-line"></i></a>`;
    nextLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderGalleryPage(currentPage);
        renderGalleryPagination();
        scrollToSection("#gallery");
      }
    });
    galleryPagination.appendChild(nextLi);
  }
}

/* -------------------------------------------------------------
 * 6. PRESTASI (ACHIEVEMENTS)
 * ------------------------------------------------------------- */
function initAchievements() {
  const classAchieveContainer = document.getElementById("achievement-container");
  const memberAchieveContainer = document.getElementById("prestasiContainer");

  // Class Achievements
  if (classAchieveContainer) {
    fetch("./assets/json/achievements.json")
      .then((res) => res.json())
      .then((data) => {
        classAchieveContainer.innerHTML = "";
        data.forEach((item) => {
          const html = `
            <div class="col-md-6 col-lg-4 achievement-item-col">
              <div class="achievement-card">
                <div class="achievement-img-wrapper">
                  <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="achievement-body">
                  <h5 class="achievement-title">${item.title}</h5>
                  <p class="achievement-desc">${item.description}</p>
                </div>
              </div>
            </div>`;
          classAchieveContainer.insertAdjacentHTML("beforeend", html);
        });

        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
          gsap.from(".achievement-item-col", {
            scrollTrigger: {
              trigger: "#achievement-container",
              start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
          });
        }
      })
      .catch((err) => console.error("Gagal memuat prestasi kelas:", err));
  }

  // Member Achievements
  if (memberAchieveContainer) {
    fetch("./assets/json/achievements-member.json")
      .then((res) => res.json())
      .then((data) => {
        memberAchieveContainer.innerHTML = "";
        data.forEach((item) => {
          const html = `
            <div class="col-md-6 col-lg-4 member-achieve-col">
              <div class="achievement-card">
                <div class="achievement-img-wrapper">
                  <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="achievement-body">
                  <div class="d-flex align-items-center gap-3 mb-3">
                    <img src="${item.thumb}" alt="${item.title}" class="rounded-circle" style="width: 44px; height: 44px; object-fit: cover; border: 2px solid var(--brand-primary);">
                    <div>
                      <h6 class="mb-0 fw-bold text-primary">${item.title}</h6>
                      <small class="badge bg-warning text-dark">${item.status}</small>
                    </div>
                  </div>
                  <p class="achievement-desc mb-0">${item.description}</p>
                </div>
              </div>
            </div>`;
          memberAchieveContainer.insertAdjacentHTML("beforeend", html);
        });

        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
          gsap.from(".member-achieve-col", {
            scrollTrigger: {
              trigger: "#prestasiContainer",
              start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
          });
        }
      })
      .catch((err) => console.error("Gagal memuat prestasi individu:", err));
  }
}

/* -------------------------------------------------------------
 * 7. SCROLL EFFECTS & BACK TO TOP
 * ------------------------------------------------------------- */
function initScrollEffects() {
  const backToTopBtn = document.getElementById("backToTop");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      if (backToTopBtn) backToTopBtn.classList.add("show");
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove("show");
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function scrollToSection(selector) {
  const elem = document.querySelector(selector);
  if (elem) {
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = elem.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}
