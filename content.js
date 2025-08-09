class EntryDateTracker {
  constructor() {
    this.targetSelector = '.css-jsqapq.e14qd5585';
    this.h2Selector = '.css-1g7tjy.e1cpvx0q5';
    this.backgroundSelector = '.css-b9mo9c.e14qd5582';
    this.observer = null;
    this.init();
  }

  init() {
    // 페이지 로드 시 초기 확인
    this.checkAndAddDateDisplay();
    
    // DOM 변화 감지를 위한 MutationObserver 설정
    this.setupObserver();
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 타겟 요소가 추가되었는지 확인
              if (node.matches && node.matches(this.targetSelector)) {
                shouldCheck = true;
              }
              // 타겟 요소를 포함하는 요소가 추가되었는지 확인
              if (node.querySelector && node.querySelector(this.targetSelector)) {
                shouldCheck = true;
              }
            }
          });
        }
      });
      
      if (shouldCheck) {
        // 약간의 지연을 두어 DOM이 완전히 업데이트된 후 실행
        setTimeout(() => this.checkAndAddDateDisplay(), 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkAndAddDateDisplay() {
    const targetElement = document.querySelector(this.targetSelector);
    if (!targetElement) return;

    // targetElement 내부에서 h2 요소 찾기
    const h2Element = targetElement.querySelector(this.h2Selector);
    if (!h2Element) return;

    // 이미 날짜 표시가 추가되어 있는지 확인
    if (h2Element.querySelector('.entry-date-display')) return;

    this.addDateDisplay(h2Element, targetElement);
  }

  calculateRemainingDays() {
    const today = new Date();
    const currentDay = today.getDate();
    
    if (currentDay <= 16) {
      // 16일 이전이면 16일까지 남은 날
      const targetDate = new Date(today.getFullYear(), today.getMonth(), 16);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        days: diffDays,
        message: `${diffDays}일 남음`
      };
    } else {
      // 16일 이후면 다음달 1일까지 남은 날
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const diffTime = nextMonth.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        days: diffDays,
        message: `${diffDays}일 남음`
      };
    }
  }

  getBackgroundColor(targetElement) {
    const backgroundElement = targetElement.querySelector(this.backgroundSelector);
    if (backgroundElement) {
      const style = window.getComputedStyle(backgroundElement);
      return style.backgroundColor || '#e74c3c'; // 기본값
    }
    return '#e74c3c'; // 기본값
  }

  addDateDisplay(h2Element, targetElement) {
    const dateInfo = this.calculateRemainingDays();
    const backgroundColor = this.getBackgroundColor(targetElement);
    
    // 날짜 표시 요소 생성
    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'entry-date-display';
    dateDisplay.textContent = dateInfo.message;
    
    // 스타일 적용
    dateDisplay.style.cssText = `
      background-color: ${backgroundColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: -30px;
      display: inline-block;
      margin-left: 280px;
      position: absolute;
      z-index: 20;
    `;
    
    // h2 요소 아래에 추가
    h2Element.parentNode.insertBefore(dateDisplay, h2Element.nextSibling);
    
    console.log('Entry 날짜 표시가 추가되었습니다:', dateInfo.message);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 확장 프로그램 초기화
let entryDateTracker = null;

// 페이지가 완전히 로드된 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    entryDateTracker = new EntryDateTracker();
  });
} else {
  entryDateTracker = new EntryDateTracker();
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (entryDateTracker) {
    entryDateTracker.destroy();
  }
});