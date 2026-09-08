// Initialize AOS (Animate On Scroll)
document.addEventListener("DOMContentLoaded", function () {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }

  // Set Current Year in Footer
  const yearElem = document.getElementById("currentYear");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // DARK / LIGHT THEME TOGGLE
  initThemeToggle();

  // HERO STATS COUNTER ANIMATION
  initStatsCounter();

  // ANGGOTA KELAS (MEMBERS) SEARCH & FILTER & PAGINATION
  initClassMembers();

  // GALERI
  initGallery();

  // PRESTASI (ACHIEVEMENTS)
  initAchievements();

  // BACK TO TOP BUTTON & NAVBAR SCROLL STATE
  initScrollEffects();
});

/* -------------------------------------------------------------
 * 1. THEME TOGGLE (DARK / LIGHT MODE)
 * ------------------------------------------------------------- */
function initThemeToggle() {
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const htmlElem = document.documentElement;

  const savedTheme = localStorage.getItem("infinithree_theme") || "dark";
  setTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const currentTheme = htmlElem.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  function setTheme(theme) {
    htmlElem.setAttribute("data-theme", theme);
    localStorage.setItem("infinithree_theme", theme);
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "ri-sun-line" : "ri-moon-line";
    }
  }
}

/* -------------------------------------------------------------
 * 2. HERO STATS ANIMATED COUNTER
 * ------------------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number");
  if (!statNumbers.length) return;

  let animated = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          statNumbers.forEach((counter) => {
            const target = parseInt(counter.getAttribute("data-target"), 10);
            let count = 0;
            const speed = Math.ceil(target / 40);

            const updateCount = () => {
              count += speed;
              if (count >= target) {
                counter.innerText = target;
              } else {
                counter.innerText = count;
                setTimeout(updateCount, 30);
              }
            };
            updateCount();
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.querySelector(".stats-container");
  if (statsSection) observer.observe(statsSection);
}

/* -------------------------------------------------------------
 * 3. ANGGOTA KELAS (MEMBERS, SEARCH, FILTER, PAGINATION)
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

  // Event Listeners for Search & Filter
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      applyFilters();
    });
  }

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

    pageItems.forEach((member, idx) => {
      const cardHTML = `
        <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${idx * 50}">
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

    if (typeof AOS !== "undefined") {
      AOS.refresh();
    }
  }

  function renderMembersPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(filteredMembers.length / pageSize);
    if (totalPages <= 1) return;

    // Previous button
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

    // Next button
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
 * 4. GALERI (WITH FANCYBOX LIGHTBOX & PAGINATION)
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

    pageItems.forEach((item, index) => {
      const html = `
        <div class="col-sm-6 col-md-4" data-aos="fade-up" data-aos-delay="${index * 50}">
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

    if (typeof AOS !== "undefined") {
      AOS.refresh();
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
 * 5. PRESTASI (ACHIEVEMENTS)
 * ------------------------------------------------------------- */
function initAchievements() {
  const classAchieveContainer = document.getElementById("achievement-container");
  const memberAchieveContainer = document.getElementById("prestasiContainer");

  // Fetch Class Achievements
  if (classAchieveContainer) {
    fetch("./assets/json/achievements.json")
      .then((res) => res.json())
      .then((data) => {
        classAchieveContainer.innerHTML = "";
        data.forEach((item, idx) => {
          const html = `
            <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${idx * 100}">
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
      })
      .catch((err) => console.error("Gagal memuat prestasi kelas:", err));
  }

  // Fetch Member Achievements
  if (memberAchieveContainer) {
    fetch("./assets/json/achievements-member.json")
      .then((res) => res.json())
      .then((data) => {
        memberAchieveContainer.innerHTML = "";
        data.forEach((item, idx) => {
          const html = `
            <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${idx * 100}">
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
      })
      .catch((err) => console.error("Gagal memuat prestasi individu:", err));
  }
}

/* -------------------------------------------------------------
 * 6. SCROLL EFFECTS & BACK TO TOP
 * ------------------------------------------------------------- */
function initScrollEffects() {
  const backToTopBtn = document.getElementById("backToTop");
  const navbar = document.getElementById("mainNavbar");

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
