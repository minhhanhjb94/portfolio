// Portfolio Interactive Script
// Scroll reveals, card effects, modal viewer, contact form, navigation tracking, language switcher

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Reveal Elements on Scroll
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // 2. Timeline Active Tracker
  // ==========================================
  const timelineItems = document.querySelectorAll('.timeline-item');

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const node = entry.target.querySelector('.timeline-node');
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        node?.style.setProperty('background', '#B8860B');
        node?.style.setProperty('box-shadow', '0 0 12px rgba(218,165,32,0.4)');
        node?.style.setProperty('transform', 'scale(1.2)');
      } else {
        node?.style.setProperty('background', '#FDF8F0');
        node?.style.setProperty('box-shadow', 'none');
        node?.style.setProperty('transform', 'scale(1)');
      }
    });
  }, {
    threshold: [0.2, 0.5, 0.8],
    rootMargin: '-20% 0px -40% 0px'
  });

  timelineItems.forEach(item => timelineObserver.observe(item));

  // ==========================================
  // 3. Dynamic Card Shine / Mouse Reflection
  // ==========================================
  const magicCards = document.querySelectorAll('.magic-card');

  magicCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Subtle shine gradient
      card.style.backgroundImage = `
        radial-gradient(circle at ${x}px ${y}px, rgba(218, 165, 32, 0.06) 0%, transparent 60%),
        linear-gradient(145deg, rgba(253, 248, 240, 0.95), rgba(245, 236, 215, 0.85))
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.backgroundImage = 'none';
    });
  });

  // ==========================================
  // 4. Project Details Modal
  // ==========================================
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const projectBtns = document.querySelectorAll('.view-project-btn');

  const projectData = {
    1: {
      title: "I-Invest! 2025 Operations",
      role: "Organizing Committee Member",
      period: "Spring 2025",
      desc: "Contributed to organizing a nationwide academic competition for finance enthusiasts. Assisted in managing event logistics, coordinating operations for nearly 10,000 participants, and ensuring engaging candidate experiences.",
      techs: ["Event Planning", "Operations Management", "Team Collaboration", "Public Relations"],
      gems: "✨ Coordinated complex operational schedules for a large-scale nationwide participant base."
    },
    2: {
      title: "SSI Securities Market Research",
      role: "Broker Intern",
      period: "Summer 2025",
      desc: "Gained exposure to financial markets and investment environments at SSI Securities Corporation. Analyzed market-related information, examined corporate financial structures, and applied quantitative models using MS Excel to support investor decision-making.",
      techs: ["Financial Analysis", "Securities Markets", "Excel Modeling", "Analytical Research"],
      gems: "✨ Applied mathematical modeling to process security listings and financial disclosures."
    },
    3: {
      title: "FTU Securities Club Communications",
      role: "Member of Communication Department",
      period: "2024 – Present",
      desc: "Curated educational financial content, organized member discussions, and supported engagement strategies for the Foreign Trade University Securities Investment Club. Formulated branding structures and digital assets to simplify financial literacy.",
      techs: ["Copywriting", "Financial Literacy", "Branding", "Social Media Design"],
      gems: "✨ Developed highly rated educational post series on foundational investment rules."
    }
  };

  projectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projId = btn.getAttribute('data-project-id');
      const data = projectData[projId];
      if (!data) return;

      document.getElementById('modal-title').innerText = data.title;
      document.getElementById('modal-role').innerText = data.role;
      document.getElementById('modal-period').innerText = data.period;
      document.getElementById('modal-desc').innerText = data.desc;
      document.getElementById('modal-gems').innerText = data.gems;

      const techContainer = document.getElementById('modal-techs');
      techContainer.innerHTML = '';
      data.techs.forEach(t => {
        const span = document.createElement('span');
        span.className = 'skill-badge text-xs';
        span.innerText = t;
        techContainer.appendChild(span);
      });

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ==========================================
  // 5. Contact Form Handler
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const msg = document.getElementById('contact-message').value.trim();

      if (!name || !email || !msg) {
        formStatus.className = "mt-4 text-center font-body text-red-600 text-sm opacity-100 transition-opacity duration-300";
        formStatus.innerText = "Please complete all fields.";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
      formStatus.className = "mt-4 text-center font-body text-gold text-sm opacity-100 animate-pulse";
      formStatus.innerText = "Sending your message...";

      setTimeout(() => {
        formStatus.className = "mt-4 text-center font-body text-green-700 text-sm opacity-100 transition-all";
        formStatus.innerHTML = "✓ Message sent successfully! Thank you for reaching out.";

        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Send Message</span>';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
          formStatus.classList.add('opacity-0');
        }, 5000);
      }, 2000);
    });
  }

  // ==========================================
  // 6. Navigation Active Link Tracker
  // ==========================================
  const navSections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    navSections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 7. Language Switcher (EN / VI)
  // ==========================================
  let currentLang = 'en';

  const translations = {
    vi: {
      // Hero
      hero_tagline: 'Sinh viên Kinh tế Quốc tế',
      hero_name: 'Nguyễn Thị <span class="hero-name-accent">Minh Hạnh</span>',
      hero_desc: 'Theo đuổi sự phát triển chuyên môn trong lĩnh vực kế toán và tài chính, đồng thời rèn luyện tư duy phân tích, khả năng thích nghi và tinh thần học tập kỷ luật.',
      hero_btn_resume: 'Xem Hồ sơ',
      hero_btn_contact: 'Liên hệ',

      // About
      about_title: 'Giới thiệu',
      about_subtitle: 'Hồ sơ cá nhân & Định hướng',
      about_profile_title: 'Về bản thân',
      about_p1: 'Tôi là <strong class="text-brown-text font-semibold">Nguyễn Thị Minh Hạnh</strong>, sinh viên Trường Đại học Ngoại thương (FTU), với sự quan tâm đặc biệt đến lĩnh vực kế toán, kiểm toán, tài chính và nghiên cứu kinh tế.',
      about_p2: 'Tôi đặc biệt quan tâm đến lĩnh vực kế toán, kiểm toán và tài chính, đồng thời mong muốn phát triển tư duy phân tích và khả năng giải quyết vấn đề thông qua các hoạt động học thuật và trải nghiệm thực tiễn. Hiện tại, tôi đang theo học ACCA và tích cực tham gia các cộng đồng tài chính để nâng cao kiến thức chuyên môn và kỹ năng nghề nghiệp.',
      about_quote: '"Định hướng phát triển chuyên môn trong lĩnh vực kế toán - kiểm toán, tài chính thông qua môi trường học thuật và trải nghiệm thực tiễn nghề nghiệp."',
      about_fields_title: 'Lĩnh vực quan tâm',
      field1_title: 'Kế toán & Kiểm toán',
      field1_desc: 'Nâng cao hiểu biết về báo cáo tài chính, theo đuổi chứng chỉ ACCA chuyên nghiệp và phát triển tư duy phân tích tài chính.',
      field2_title: 'Kinh tế Quốc tế',
      field2_desc: 'Nghiên cứu thị trường toàn cầu, thương mại quốc tế và mô hình kinh tế tại Trường Đại học Ngoại thương (GPA: 3.75/4.0).',
      field3_title: 'Truyền thông sáng tạo',
      field3_desc: 'Chuyển hóa các nội dung mang tính phân tích thành thông điệp trực quan, dễ tiếp cận và có giá trị giáo dục.',

      // Resume
      resume_title: 'Hồ sơ năng lực',
      resume_subtitle: 'Lịch sử Nghề nghiệp & Bằng cấp',
      resume_exp_title: 'Kinh nghiệm & Trình độ chuyên môn',
      exp1_title: 'Thực tập sinh Môi giới',
      exp1_company: 'Công ty Chứng khoán SSI',
      exp1_d1: 'Tiếp cận môi trường tài chính và thị trường chứng khoán thực tế.',
      exp1_d2: 'Phân tích báo cáo tài chính nhằm đánh giá doanh nghiệp và xu hướng thị trường.',
      exp1_d3: 'Áp dụng tư duy phân tích trong quá trình xử lý dữ liệu giá chứng khoán.',
      exp1_d4: 'Phát triển kỹ năng phối hợp và báo cáo trong môi trường làm việc nhóm.',
      exp2_title: 'Thành viên Ban Tổ chức',
      exp2_company: 'Cuộc thi I-Invest! 2025',
      exp2_d1: 'Hỗ trợ điều phối vận hành và công tác tổ chức cuộc thi.',
      exp2_d2: 'Làm việc với gần 10.000 thí sinh trên toàn quốc trong các giai đoạn của chương trình.',
      exp2_d3: 'Phối hợp với nhiều ban chuyên môn trong môi trường áp lực cao.',
      exp3_title: 'Phó Trưởng Ban Tổ chức',
      exp3_company: 'Sự kiện Tuyển thành viên (CLB Chứng khoán SIC)',
      exp3_d1: 'Hỗ trợ đánh giá hồ sơ ứng viên và điều phối quy trình tuyển chọn.',
      exp3_d2: 'Kết nối và phối hợp giữa các bộ phận tuyển thành viên.',
      exp3_d3: 'Tham gia lựa chọn các ứng viên có định hướng trong lĩnh vực tài chính và kinh tế.',
      exp4_title: 'Thành viên Ban Truyền thông',
      exp4_company: 'CLB Chứng khoán (SIC FTU)',
      exp4_d1: 'Thiết kế nội dung và bài viết liên quan đến tài chính và đầu tư.',
      exp4_d2: 'Hỗ trợ phát triển tương tác trong cộng đồng sinh viên quan tâm đến tài chính.',

      // Education
      edu_title: 'Học vấn',
      edu1_degree: 'Cử nhân Kinh tế Quốc tế',
      edu1_school: 'Đại học Ngoại thương (FTU)',
      edu1_grad: '• Dự kiến tốt nghiệp: 2028',
      edu1_focus: '• Định hướng học tập: Kế toán, tài chính',
      edu2_degree: 'Chứng chỉ ACCA',
      edu2_status: 'Đang theo học',
      edu2_school: 'Hiệp hội Kế toán Công chứng Anh Quốc',
      edu2_d1: '• Đã hoàn thành: <strong class="text-brown-text">FA (Kế toán Tài chính)</strong>',
      edu2_d2: '• Đang học: <strong class="text-brown-text">FR (Báo cáo Tài chính)</strong>',

      // Skills
      skills_title: 'Kỹ năng',
      skills_tech: 'Kỹ năng Chuyên môn',
      skills_soft: 'Kỹ năng Mềm',
      skills_lang: 'Ngôn ngữ',

      // Awards
      awards_title: 'Học bổng & Thành tích',
      award1_title: 'Học bổng Chương trình Big4 Preparation Program',
      award1_desc: 'Trung tâm Đào tạo BISC',

      // Projects
      projects_title: 'Dự án Tiêu biểu',
      projects_subtitle: 'Một số hoạt động nổi bật về nghiên cứu tài chính và vận hành tổ chức',
      proj1_title: 'Hỗ trợ vận hành I-Invest! 2025',
      proj1_desc: 'Hỗ trợ điều phối và tổ chức cuộc thi học thuật tài chính quy mô toàn quốc dành cho sinh viên.',
      proj2_title: 'Thực tập Chứng khoán SSI',
      proj2_desc: 'Xây dựng và quản lý hệ thống dữ liệu theo dõi cổ phiếu, báo cáo doanh nghiệp và biến động chỉ số thị trường.',
      proj3_title: 'Truyền thông CLB Chứng khoán',
      proj3_desc: 'Thực hiện nội dung truyền thông và định hướng hình ảnh nhằm đơn giản hóa kiến thức tài chính cho sinh viên.',
      view_details: 'Xem Chi tiết',

      // Contact
      contact_title: 'Liên hệ',
      contact_subtitle: 'Kết nối cho cơ hội học tập và phát triển',
      form_name: 'Họ và Tên',
      form_email: 'Địa chỉ Email',
      form_message: 'Tin nhắn',
      form_send: 'Gửi Tin nhắn',
    }
  };

  // Store original EN content
  const enContent = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    enContent[el.getAttribute('data-i18n')] = el.innerHTML;
  });

  const langToggleBtns = document.querySelectorAll('.lang-toggle');

  if (langToggleBtns.length > 0) {
    langToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentLang === 'en') {
          currentLang = 'vi';
          
          // Update both mobile and desktop EN/VI labels
          document.querySelectorAll('[id^="lang-label-en"]').forEach(el => el.classList.remove('lang-active'));
          document.querySelectorAll('[id^="lang-label-vi"]').forEach(el => el.classList.add('lang-active'));

          // Apply Vietnamese translations
          document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations.vi[key]) {
              el.innerHTML = translations.vi[key];
            }
          });
        } else {
          currentLang = 'en';
          
          // Update both mobile and desktop EN/VI labels
          document.querySelectorAll('[id^="lang-label-vi"]').forEach(el => el.classList.remove('lang-active'));
          document.querySelectorAll('[id^="lang-label-en"]').forEach(el => el.classList.add('lang-active'));

          // Restore English content
          document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (enContent[key]) {
              el.innerHTML = enContent[key];
            }
          });
        }
      });
    });
  }

  // ==========================================
  // 8. 3D Tilt Card Interaction for Contact Card
  // ==========================================
  const contactCard = document.querySelector('#contact .magic-card');
  if (contactCard) {
    contactCard.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';
    
    contactCard.addEventListener('mousemove', (e) => {
      const rect = contactCard.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside the element
      const y = e.clientY - rect.top;  // y coordinate inside the element
      
      // Calculate rotation (-6 to 6 degrees max for subtle and premium feeling)
      const rotateY = ((x / rect.width) - 0.5) * 12;
      const rotateX = (((y / rect.height) - 0.5) * -12);
      
      // Apply the transformations and shifting box shadow
      contactCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      contactCard.style.boxShadow = `
        ${-rotateY * 2}px ${rotateX * 2}px 38px rgba(18, 8, 10, 0.45),
        0 0 25px rgba(229, 189, 75, 0.15),
        inset 0 0 35px rgba(139, 101, 8, 0.1)
      `;
    });
    
    contactCard.addEventListener('mouseleave', () => {
      contactCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      contactCard.style.boxShadow = '';
    });
  }

});
