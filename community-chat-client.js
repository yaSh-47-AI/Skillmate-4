// SkillMate Messenger Engine (Replaced legacy client)
(() => {
  'use strict';
  window.openDiscord = function(targetId) {
    if (window.GlassChat) window.GlassChat.open(targetId);
  };
})();
