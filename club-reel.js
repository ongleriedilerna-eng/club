/* Club Dilerna : la maquette branchée sur le vrai serveur.
   Actif seulement en « mode réel » (?reel=1 sur l'ordi, ou sur club.dilerna.fr).
   Le look et les écrans de la maquette ne changent pas : on remplace juste ce qui était « pour de faux »
   (paiement, connexion, roue, essai photo, reçus, désabonnement, cartes cadeaux…) par le vrai serveur.
   La maquette lit ses infos dans le téléphone (localStorage) : on y recopie ce que dit le serveur. */
(function () {
  if (!window.CLUB_REEL || !window.Club) return;
  document.documentElement.classList.add('reel');
  /* L'écran de connexion « L'Essentielle » (choisi par Marie le 27/10) : couleurs, typo et logo du site dilerna.fr */
  var CSS_CONNEXION = [
    'html.reel .space:has(.space-lock:not([hidden])) { background: radial-gradient(130% 55% at 50% 0%, #fff 0%, #F8F4EC 60%, #EFE7DB 100%); }',
    'html.reel .space:has(.space-lock:not([hidden])) > .space-top { position: absolute; top: 0; right: 0; z-index: 4; padding: 14px 14px 0; }',
    'html.reel .space:has(.space-lock:not([hidden])) > .space-top :is(.space-crown, .space-kicker, h2) { display: none; }',
    'html.reel .space-lock { position: relative; flex: 1 0 auto; min-height: 100%; display: flex; flex-direction: column; padding: 12px 18px 10px; gap: 0; text-align: left; font-family: "DM Sans", system-ui, sans-serif; color: #210202; }',
    'html.reel .space-lock > .cl-rejoindre { margin-top: auto; }',
    'html.reel .space-lock > .cl-carte { margin-top: auto; }',
    'html.reel .space-lock > .cl-haut { margin-top: auto; }',
    '.cl-haut { display: grid; justify-items: center; gap: 10px; text-align: center; padding: 0 0 12px; }',
    '.cl-logo { width: 214px; height: auto; margin: 0 0 4px; }',
    '.cl-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; background: #F5DFDB; color: #4E2E22; font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }',
    '.cl-badge svg { width: 12px; height: 12px; fill: #8E5E45; }',
    'html.reel .space-lock .cl-titre { margin: 12px 0 0; font: 400 31px/1.08 "Gloock", Georgia, serif; color: #210202; text-wrap: balance; }',
    'html.reel .space-lock .cl-sous { margin: 0; max-width: 27ch; color: #6E5248; font-size: 13.5px; line-height: 1.45; }',
    '.cl-carte { margin-top: 24px; padding: 16px; border-radius: 24px; background: #FFFAF5; box-shadow: 0 0 0 1px rgba(33,2,2,.13), 0 18px 34px -24px rgba(78,46,34,.55); display: grid; gap: 11px; }',
    '.cl-carte:has(#milky-code[hidden]) { display: none; }',
    '.cl-champ { position: relative; display: block; }',
    'html.reel .space-lock .cl-champ input { width: 100%; height: 54px; margin: 0; border-radius: 16px; padding: 21px 46px 5px 44px; border: 1.5px solid rgba(33,2,2,.13); background: #fff; color: #210202; font: 500 16px "DM Sans", system-ui, sans-serif; letter-spacing: 0; text-transform: none; text-align: left; outline: none; transition: border-color .2s, box-shadow .2s; }',
    'html.reel .space-lock .cl-champ input:focus { border-color: #8E5E45; box-shadow: 0 0 0 4px rgba(142,94,69,.12); outline: none; }',
    'html.reel .space-lock .cl-champ input.err { border-color: #B5543C; }',
    '.cl-champ em { position: absolute; left: 44px; top: 17px; font-style: normal; font-size: 14.5px; color: #6E5248; pointer-events: none; transition: top .18s, font-size .18s; }',
    '.cl-champ input:focus + em, .cl-champ input:not(:placeholder-shown) + em { top: 8px; font-size: 11px; letter-spacing: .03em; }',
    '.cl-champ .cl-ic { position: absolute; left: 14px; top: 17px; width: 19px; height: 19px; fill: none; stroke: #6E5248; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }',
    '.cl-oeil { position: absolute; right: 6px; top: 7px; width: 40px; height: 40px; border: 0; border-radius: 12px; background: none; color: #6E5248; display: grid; place-items: center; cursor: pointer; }',
    '.cl-oeil svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }',
    'html.reel .space-lock .cl-err { margin: -2px 2px 0; font-size: 13px; color: #B5543C; text-align: left; }',
    '.cl-oubli { justify-self: end; background: none; border: 0; padding: 2px; font: 600 13px "DM Sans", system-ui, sans-serif; color: #8E5E45; cursor: pointer; }',
    'html.reel .space-lock .cl-btn { width: 100%; height: 54px; margin: 4px 0 0; border: 0; border-radius: 999px; background: #4E2E22; color: #F8F4EC; font: 700 15.5px "DM Sans", system-ui, sans-serif; box-shadow: 0 12px 22px -12px rgba(78,46,34,.75); cursor: pointer; }',
    'html.reel .space-lock .cl-btn:disabled { opacity: .6; }',
    'html.reel .space-lock .cl-sur { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0; font-size: 11.5px; color: #A89A8B; }',
    '.cl-sur svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2; }',
    'html.reel .space-lock .lock-lien { margin-top: 14px; text-align: center; }',
    'html.reel .space-lock [data-reabo] { margin-top: 18px; }',
    '.cl-rejoindre { position: relative; z-index: 1; margin-top: 18px; display: flex; align-items: center; gap: 12px; padding: 13px 14px 13px 16px; border-radius: 20px; background: #F5DFDB; color: #210202; text-decoration: none; text-align: left; }',
    '.cl-rejoindre b { display: block; font: 400 16px "Gloock", Georgia, serif; }',
    '.cl-rejoindre small { color: #6E5248; font-size: 11.5px; }',
    '.cl-rejoindre i { margin-left: auto; flex: none; width: 32px; height: 32px; border-radius: 50%; background: #fff; display: grid; place-items: center; font-style: normal; }',
    '.cl-louise { position: relative; z-index: 2; height: 86px; margin: -34px -18px 0; overflow-x: clip; overflow-y: visible; pointer-events: none; }',
    '.cl-louise .lw { left: -110px; bottom: 6px; will-change: left, transform; }',
    '.cl-louise .lw.court .lw-p, .cl-louise .lw.court .lw-corps { animation-duration: .12s; }',
    '.cl-pas { position: absolute; bottom: 4px; width: 13px; height: 13px; fill: #8B4A2B; opacity: 0; pointer-events: none; }',
    '.cl-rejoindre i { position: relative; transition: transform .14s cubic-bezier(.3,.7,.4,1), background .2s, color .2s, box-shadow .2s; }',
    '.cl-rejoindre i.appuye { transform: scale(.82); background: #4E2E22; color: #F8F4EC; box-shadow: inset 0 2px 5px rgba(0,0,0,.35); }',
    '.cl-rejoindre.touche { background: #F1D3CE; }',
    '.cl-onde { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #8E5E45; pointer-events: none; }',
    '.cl-coeur { position: absolute; left: 50%; top: -6px; width: 14px; height: 14px; margin-left: -7px; fill: #C77D93; pointer-events: none; }'
  ].join(' ');
  /* Créneaux : tant que l'agenda de Marie n'est pas relié, pas de créneaux d'exemple, ni d'alerte, ni de notifications (audit du 27/10) */
  var CSS_CRENEAUX = [
    'html.reel [data-alert]:not(.cr-on), html.reel [data-sp="slots"] .slot:not(.slot-r), html.reel [data-sp="slots"] .sp-intro, html.reel [data-sp="slots"] .sp-note, html.reel [data-nt], html.reel [data-nt-hint], html.reel [data-notif-ios], html.reel [data-cp-go="slots"] { display: none !important; }',
    '.slots-vide { margin: 18px 4px 0; padding: 26px 20px; border-radius: 22px; background: #FFFAF5; box-shadow: 0 0 0 1px rgba(33,2,2,.1); text-align: center; display: grid; gap: 8px; }',
    '.slots-vide b { font-size: 16px; color: #210202; }',
    '.slots-vide p { margin: 0; font-size: 14px; line-height: 1.45; color: #6E5248; }',
    '.slots-r { margin: 14px 4px 0; }',
    '.slot-r .slot-tag { white-space: nowrap; }',
    '.slot-r .slot-tag.attente { background: #F3E9DE; color: #8E5E45; padding: 6px 10px; border-radius: 999px; }',
    '.cr-voile { position: fixed; inset: 0; z-index: 9999; background: rgba(43,26,16,.4); display: grid; align-items: end; justify-items: center; }',
    '.cr-pop { width: 100%; max-width: 440px; background: #FAF7F3; border-radius: 26px 26px 0 0; padding: 22px 20px calc(22px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 10px; text-align: center; font-family: "DM Sans", system-ui, sans-serif; color: #2B1A10; }',
    '.cr-pop b { font: 400 22px "Gloock", Georgia, serif; }',
    '.cr-pop p { margin: 0 0 4px; font-size: 14px; line-height: 1.45; color: #6E5248; }',
    '.cr-pop button { border: 0; border-radius: 999px; padding: 14px; font: 700 14px "DM Sans", system-ui, sans-serif; cursor: pointer; }',
    '.cr-pop .cr-oui { background: #2B1A10; color: #FBF7F2; } .cr-pop .cr-non { background: rgba(43,26,16,.07); color: #2B1A10; }',
    '.cr-pop .cr-err { color: #B5543C; }'
  ].join(' ');

  /* les petites mentions « Démo » de la maquette disparaissent */
  var st = document.createElement('style'); st.textContent = 'html.reel .onb-demo, html.reel .demo-note, html.reel .roue-demo, html.reel [data-lock-ouvrir], html.reel [data-abo-fin-demo], html.reel [data-abo-demo], html.reel [data-abo-nom], html.reel [data-gal-demo], html.reel [data-cg-vide], html.reel [data-roue-demo] { display: none !important; }' +
' ' + CSS_CONNEXION + ' ' + CSS_CRENEAUX; document.head.appendChild(st);

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var SEG = ['-1 €', '-5 €', 'Perdu', '-10 €', '-1 €', '-5 €', 'Perdu', 'Pose offerte'];   /* les cases de la roue */
  var Q = function (s) { return document.querySelector(s); };
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    } catch (e) { return null; }
  }
  function json(k) { try { return JSON.parse(ls(k) || 'null'); } catch (e) { return null; } }
  function aujourdhui() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function jour(d) { return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function de(m) { return (/^[aeiou]/.test(MOIS[m]) ? 'd’' : 'de ') + MOIS[m]; }
  function param(n) { var m = new RegExp('[?&]' + n + '=([^&#]+)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }
  function sansParam(noms) {
    var u = new URL(location.href); noms.forEach(function (n) { u.searchParams.delete(n); });
    history.replaceState(null, '', u.pathname + (u.searchParams.toString() ? '?' + u.searchParams : '') + u.hash);
  }
  function ui() { return window.ClubUI || {}; }
  function quandPret(f) { if (window.ClubUI) f(); else setTimeout(function () { quandPret(f); }, 60); }

  /* ---------- 1. Recopier le serveur dans le téléphone ---------- */
  function signature() { var m = json('dilerna-membre'); return JSON.stringify([!!ls('dilerna-acces'), m && m.debut, m && m.fin, m && m.prenom]); }
  var auDepart = signature();

  async function sync() {
    var s = await Club.session();
    try {
      var p = await Club.places(), avant = ls('dilerna-club-membres');
      ls('dilerna-club-membres', String(p.membres));
      if (avant !== String(p.membres)) quandPret(function () { if (ui().rafraichir) ui().rafraichir(); });
    } catch (e) {}
    if (!s) {
      ['dilerna-membre', 'dilerna-acces', 'dilerna-cagnotte', 'dilerna-roue', 'dilerna-roue-n'].forEach(function (k) { ls(k, null); });
      return null;
    }
    var moi = await Club.moi(), ab = moi && moi.abonnement, pr = moi && moi.profil;
    /* Marie (compte admin) a accès à tout le club gratuitement, sans abonnement (30/10/2026) */
    if (pr && pr.est_admin && (!ab || ab.statut === 'en_attente' || ab.statut === 'termine')) ab = { statut: 'actif', debut: pr.cree_le, fin_periode: null };
    if (!ab || ab.statut === 'en_attente') { ls('dilerna-membre', null); ls('dilerna-acces', null); return moi; }

    var fin = (ab.arret_demande || ab.statut === 'termine' || ab.statut === 'cadeau') ? ab.fin_periode : null;
    /* le serveur a le dernier mot (impayé depuis plus de 7 jours, abonnement arrêté tout de suite par Marie…) : l'espace se ferme */
    var ok = await Club.sb.rpc('est_membre', { uid: s.user.id });
    if (!ok.error && ok.data === false) fin = new Date(Date.now() - 60e3).toISOString();
    var mb = { prenom: pr.prenom, nom: pr.nom, mail: pr.email, debut: ab.debut, reel: true };
    if (fin) mb.fin = fin;
    ls('dilerna-membre', mb);
    ls('dilerna-acces', { d: aujourdhui(), pw: 'noupi' });   /* = « connectée » pour la maquette (la vraie sécurité est sur le serveur) */
    if (pr.naissance_mois) ls('dilerna-naissance', { j: pr.naissance_jour, m: pr.naissance_mois });

    /* la cagnotte depuis la date anniversaire de son abonnement (comme cagDebut() de la maquette) */
    var s0 = new Date(ab.debut), now = new Date(), a = new Date(now.getFullYear(), s0.getMonth(), s0.getDate());
    if (a > now) a.setFullYear(a.getFullYear() - 1);
    ls('dilerna-cagnotte', { p: a.getFullYear() + '-' + (a.getMonth() + 1) + '-' + a.getDate(),
      l: moi.mouvements.filter(function (x) { return new Date(x.cree_le) >= a; }).map(function (x) {
        var r = /Roue de (\d\d)\/\d{4}/.exec(x.motif);
        return { t: r ? 'Roue ' + de(+r[1] - 1) : (x.montant_cents < 0 ? 'Utilisé sur ta pose' : x.motif), v: x.montant_cents / 100 };
      }) });

    /* la roue de ce mois-ci */
    var cle = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
    var t = moi.tours.filter(function (x) { return x.mois === cle; })[0];
    if (t) ls('dilerna-roue', { m: now.getFullYear() + '-' + (now.getMonth() + 1), t: t.resultat }); else ls('dilerna-roue', null);
    ls('dilerna-roue-n', String(moi.tours.length));

    /* paiement refusé : le bandeau */
    quandPret(function () { var ko = Q('[data-pay-ko]'); if (ko) ko.hidden = ab.statut !== 'impaye'; });
    return moi;
  }

  /* si ce que dit le serveur change l'accès (connectée, désabonnée…), on recharge une fois la page */
  function rechargeSiBesoin() {
    if (signature() === auDepart) return;
    var n = +(sessionStorage.getItem('club-recharge') || 0), t = +(sessionStorage.getItem('club-recharge-t') || 0);
    if (Date.now() - t > 15000) n = 0;
    if (n >= 2) return;
    sessionStorage.setItem('club-recharge', String(n + 1)); sessionStorage.setItem('club-recharge-t', String(Date.now()));
    location.reload();
  }

  /* ---------- 2. Les retours de Stripe et des e-mails ---------- */
  async function auDemarrage() {
    var bienvenue = param('bienvenue'), cadeauAchete = param('cadeau_achete');
    if (param('connexion')) sansParam(['connexion']);
    if (bienvenue) return finirInscription(bienvenue);
    var sRecup = await Club.session();       /* attend que Supabase ait lu le lien reçu par e-mail */
    if (sRecup && window.CLUB_RECUP) { window.CLUB_RECUP = false; quandPret(function () { ecranMotDePasse('nouveau'); }); return; }
    if (cadeauAchete) { quandPret(function () { carteAchetee(cadeauAchete); }); }
    if (param('abonnement') === 'annule') sansParam(['abonnement']);
    await sync();
    rechargeSiBesoin();
    vueMembre();
    chargerCreneaux();
  }

  /* une membre connectée arrive directement dans son espace (la maquette ouvrait toujours la fiche) */
  function estMembreConnectee() { var m = json('dilerna-membre'); return !!(ls('dilerna-acces') && m && !(m.fin && new Date(m.fin) <= new Date())); }
  function vueMembre() {
    quandPret(function () {
      if (!estMembreConnectee()) return;
      var phone = Q('[data-phone]'); phone.classList.remove('open'); phone.classList.add('space-open');
    });
  }

  /* après le paiement : « Paiement accepté », « Choisis ton mot de passe », puis « Bienvenue dans le club » */
  function finirInscription(sid) {
    quandPret(function () {
      var U = ui(), onb = U.onb, phone = onb.closest('[data-phone]') || document;
      phone.classList && phone.classList.add('open');
      onb.hidden = false; U.onbEtape(2);
      onb.querySelector('[data-onb-pay-msg]').textContent = 'Paiement accepté ✓'; onb.querySelector('[data-onb-spin]').classList.add('ok');
      setTimeout(function () {
        ecranMotDePasse('inscription', function (mdp) {
          return Club.finirInscription(sid, mdp).then(function (d) { sansParam(['bienvenue']); return d.prenom; });
        });
      }, 1200);
    });
  }

  /* l'écran « Choisis ton mot de passe » (dans le style des écrans de la maquette) */
  function etapeMdp() {
    var onb = ui().onb, el = onb.querySelector('[data-onb-step="3"]');
    if (el) return el;
    el = document.createElement('div'); el.className = 'onb-step'; el.dataset.onbStep = '3'; el.hidden = true;
    el.innerHTML = '<svg class="onb-crown" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 18 2.5 8l5 4.2L12 5l4.5 7.2 5-4.2-1 10z"/></svg>' +
      '<p class="onb-k" data-mdp-k>Ton espace</p><h3 class="onb-t" data-mdp-t>Choisis ton mot de passe</h3>' +
      '<p class="onb-note" data-mdp-s style="margin:0 0 6px">Pour retrouver ton espace si tu changes de téléphone.</p>' +
      '<form class="onb-form" onsubmit="return false">' +
      '<label class="onb-f"><span>Mot de passe</span><input type="password" autocomplete="new-password" data-mdp1></label>' +
      '<label class="onb-f"><span>Encore une fois</span><input type="password" autocomplete="new-password" data-mdp2></label></form>' +
      '<p class="onb-err" data-mdp-err></p>' +
      '<button type="button" class="onb-pay apple" data-mdp-go>Entrer dans le club</button>' +
      '<p class="onb-note">6 caractères minimum.</p>';
    var bienvenue = onb.querySelector('[data-onb-step="4"]'); onb.insertBefore(el, bienvenue);
    return el;
  }
  /* mode : « inscription » ou « cadeau » (envoyer(mdp) fait le travail et renvoie le prénom), « nouveau » (mot de passe oublié) */
  function ecranMotDePasse(mode, envoyer) {
    var U = ui(), onb = U.onb, el = etapeMdp(), phone = onb.closest('[data-phone]');
    if (phone) phone.classList.add('open');
    el.querySelector('[data-mdp-k]').textContent = mode === 'nouveau' ? 'Mot de passe oublié' : 'Ton espace';
    el.querySelector('[data-mdp-t]').textContent = mode === 'nouveau' ? 'Ton nouveau mot de passe' : 'Choisis ton mot de passe';
    el.querySelector('[data-mdp-s]').hidden = mode === 'nouveau';
    el.querySelector('[data-mdp-go]').textContent = mode === 'nouveau' ? 'Enregistrer et entrer' : 'Entrer dans le club';
    el.querySelectorAll('input').forEach(function (i) { i.value = ''; });
    onb.hidden = false; U.onbEtape(3);
    var go = el.querySelector('[data-mdp-go]'), err = el.querySelector('[data-mdp-err]'); err.textContent = '';
    go.onclick = async function () {
      var a = el.querySelector('[data-mdp1]').value, b = el.querySelector('[data-mdp2]').value;
      if (a.length < 6) { err.textContent = '6 caractères minimum'; return; }
      if (a !== b) { err.textContent = 'Les deux mots de passe ne sont pas pareils'; return; }
      err.textContent = ''; go.disabled = true;
      try {
        if (mode === 'nouveau') {
          await Club.nouveauMotDePasse(a);
          await sync(); location.reload(); return;
        }
        var prenom = await envoyer(a);
        if (prenom === false) return;            /* déjà géré (ex. compte existant) */
        await sync(); auDepart = signature();
        if (U.membreAbo) U.membreAbo();
        onb.querySelector('[data-onb-hello]').textContent = 'Bienvenue dans le club, ' + (prenom || '');
        U.onbEtape(4); U.onbEtoiles(); U.louiseBalade();
      } catch (x) {
        if (/connecte-toi|expiré/i.test(x.message)) { sansParam(['bienvenue']); onb.hidden = true; return ouvrirConnexion(x.message); }
        err.textContent = x.message;
      } finally { go.disabled = false; }
    };
  }

  /* l'écran de connexion de la maquette (« Déjà membre ? Je me connecte ») */
  function ouvrirConnexion(message) {
    var phone = Q('[data-phone]');
    phone.classList.remove('open'); phone.classList.add('space-open');
    var err = Q('[data-err]');
    if (message) { err.textContent = message; err.hidden = false; }
  }

  /* ---------- 3. Les boutons ---------- */
  var roueIdx = null, roueEnCours = false, carte = null;
  window.ClubReel = { prendreRoue: function () { var i = roueIdx; roueIdx = null; return i; }, jouer: Club.jouer };

  var maCarteChargee = false;
  document.addEventListener('click', function (e) {
    var o = e.target.closest && e.target.closest('[data-open]');
    if (o && estMembreConnectee()) { e.preventDefault(); e.stopImmediatePropagation(); var ph = Q('[data-phone]'); ph.classList.add('space-open'); return; }
    /* Mon abonnement : on va chercher sa vraie carte chez Stripe (une fois par visite) */
    if (e.target.closest && e.target.closest('[data-sp-open="abo"],[data-cp-go="abo"]') && !maCarteChargee) {
      maCarteChargee = true;
      Club.maCarte().then(function (c) {
        var cc = Q('[data-carte-change] small'); if (cc && c) cc.textContent = c.marque + ' •••• ' + c.fin;
      }).catch(function () { maCarteChargee = false; });
    }
    var oubli = e.target.closest && e.target.closest('[data-club-oubli]');
    if (oubli) {
      e.preventDefault();
      var cm = Q('#milky-code'), erm = Q('[data-err]'), vm = cm.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(vm)) { cm.classList.add('err'); erm.textContent = 'Écris d’abord ton e-mail'; erm.hidden = false; return; }
      Club.motDePasseOublie(vm).then(function () {
        erm.hidden = true;
        Q('[data-lock-lien-t]').textContent = 'Ouvre l’e-mail qu’on vient d’envoyer à ' + vm + ' pour choisir un nouveau mot de passe.';
        Q('[data-lock-lien]').hidden = false;
      }).catch(function (x) { erm.textContent = x.message; erm.hidden = false; });
      return;
    }
    var cp = e.target.closest && e.target.closest('[data-cp-mdp-ok]');
    if (cp) {
      e.preventDefault(); e.stopImmediatePropagation();
      var a0 = Q('[data-cp-mdp0]').value, a1 = Q('[data-cp-mdp1]').value, a2 = Q('[data-cp-mdp2]').value, mm = Q('[data-cp-mdp-msg]');
      if (!a0) { mm.textContent = 'Entre ton mot de passe actuel'; return; }
      if (a1.length < 6) { mm.textContent = 'Le nouveau mot de passe doit faire au moins 6 caractères'; return; }
      if (a1 !== a2) { mm.textContent = 'Les deux nouveaux mots de passe ne sont pas pareils'; return; }
      mm.textContent = '…';
      Club.changerMotDePasse(a0, a1).then(function () {
        ['[data-cp-mdp0]', '[data-cp-mdp1]', '[data-cp-mdp2]'].forEach(function (k) { Q(k).value = ''; });
        mm.textContent = '✓ Mot de passe changé';
      }).catch(function (x) { mm.textContent = x.message; });
      return;
    }
    var t = e.target.closest && e.target.closest('[data-onb-pay],[data-unlock],[data-lock-ouvrir],[data-roue-go],[data-cg-go],[data-abo-yes],[data-carte-change],[data-carte-open],[data-recus-open],[data-gift-pay],[data-gift-share],[data-cp-out],[data-hz-go]');
    if (!t) return;
    var stop = function () { e.preventDefault(); e.stopImmediatePropagation(); };

    /* S'abonner : la vraie page de paiement Stripe (carte ou Apple Pay) — ou activer une carte cadeau */
    if (t.matches('[data-onb-pay]')) {
      stop();
      var onb = t.closest('[data-onb]'), err = onb.querySelector('[data-onb-err]');
      var pr = onb.querySelector('[data-onb-prenom]').value.trim(), no = onb.querySelector('[data-onb-nom]').value.trim();
      var ma = onb.querySelector('[data-onb-mail]').value.trim(), pa = onb.querySelector('[data-onb-parrain]').value.trim();
      if (!pr || !no) { err.textContent = 'Il manque ton prénom ou ton nom'; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ma)) { err.textContent = 'Ton e-mail n’a pas l’air complet'; return; }
      err.textContent = '';
      var maj = function (x) { return x.charAt(0).toUpperCase() + x.slice(1); };
      var code = param('cadeau');
      if (code) {                                /* carte cadeau : elle choisit son mot de passe, et son mois est activé */
        ecranMotDePasse('cadeau', function (mdp) {
          return Club.activerCadeau(code, maj(pr), maj(no), ma, mdp).then(function (d) {
            sansParam(['cadeau', 'de']);
            if (d.deja_compte) { onb.hidden = true; ouvrirConnexion('Ton mois offert est activé ✓ Connecte-toi avec ton mot de passe habituel.'); return false; }
            return maj(pr);
          });
        });
        return;
      }
      ui().onbEtape(2); onb.querySelector('[data-onb-spin]').classList.remove('ok');
      onb.querySelector('[data-onb-pay-msg]').textContent = 'On t’emmène au paiement sécurisé…';
      Club.sAbonner(maj(pr), maj(no), ma, pa).catch(function (x) { ui().onbEtape(1); err.textContent = x.message; });
      return;
    }

    /* Connexion : e-mail + mot de passe */
    if (t.matches('[data-unlock]')) {
      stop();
      var c = Q('#milky-code'), mp = Q('#club-mdp'), er = Q('[data-err]'), v = c.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { c.classList.add('err'); er.textContent = 'Écris ton e-mail'; er.hidden = false; return; }
      if (!mp.value) { mp.classList.add('err'); er.textContent = 'Écris ton mot de passe'; er.hidden = false; return; }
      t.disabled = true;
      Club.connexion(v, mp.value).then(async function () {
        er.hidden = true; await sync(); location.reload();
      }).catch(function (x) { mp.classList.add('err'); er.textContent = x.message; er.hidden = false; t.disabled = false; });
      return;
    }
    if (t.matches('[data-lock-ouvrir]')) { stop(); return; }   /* le bouton « Démo : ouvrir le lien » n'existe plus en vrai */

    /* La roue : le tirage se fait sur le serveur, la maquette fait juste tourner jusqu'à la bonne case */
    if (t.matches('[data-roue-go]')) {
      if (roueIdx !== null) return;              /* c'est notre 2e clic : on laisse la maquette faire tourner */
      stop();
      if (roueEnCours || t.disabled) return;
      roueEnCours = true;
      Club.tournerRoue().then(function (r) {
        if (r.deja) { var d = new Date(); ls('dilerna-roue', { m: d.getFullYear() + '-' + (d.getMonth() + 1), t: r.resultat }); roueIdx = null; }
        else {
          var choix = SEG.map(function (x, i) { return x === r.resultat ? i : -1; }).filter(function (i) { return i >= 0; });
          roueIdx = choix[Math.floor(Math.random() * choix.length)];
        }
        roueEnCours = false;
        if (r.deja) roueIdx = -1;               /* -1 : on laisse passer, la maquette affiche « déjà tourné ce mois-ci » */
        t.click(); roueIdx = null;
      }).catch(function (x) { roueEnCours = false; var res = Q('[data-roue-res]'); if (res) { res.textContent = x.message; res.className = 'roue-res'; } });
      return;
    }

    /* La cagnotte : c'est Marie qui la déduit au salon */
    if (t.matches('[data-cg-go]')) {
      stop();
      var tot = parseFloat((Q('[data-cg-total]').textContent || '0').replace(',', '.')) || 0, dispo = Math.floor(tot / 5) * 5;
      Q('[data-cg-msg]').textContent = dispo ? 'Montre-le à Marie au salon : elle déduira ' + dispo + ' € de ta pose 🤎' : '';
      return;
    }

    /* Me désabonner : en vrai, en un clic */
    if (t.matches('[data-abo-yes]')) {
      stop();
      t.disabled = true;
      Club.seDesabonner().then(function (fin) {
        var mb = json('dilerna-membre'); if (mb) { mb.fin = fin; ls('dilerna-membre', mb); auDepart = signature(); }
        Q('[data-abo-end2]').textContent = jour(new Date(fin));
        Q('[data-abo-confirm]').hidden = true; Q('[data-abo-done]').hidden = false;
      }).catch(function (x) { Q('[data-abo-msg]').textContent = x.message; }).then(function () { t.disabled = false; });
      return;
    }

    /* Changer ma carte (et le bandeau « paiement pas passé ») : la page sécurisée de Stripe */
    if (t.matches('[data-carte-change],[data-carte-open]')) {
      stop();
      Club.changerCarte().catch(function (x) { alert(x.message); });
      return;
    }

    /* Mes reçus : les vrais, avec le PDF */
    if (t.matches('[data-recus-open]')) {
      stop();
      var ul = Q('[data-recus]');
      if (!ul.hidden) { ul.hidden = true; return; }
      ul.innerHTML = '<li><span><small>Chargement…</small></span></li>'; ul.hidden = false;
      Club.recus().then(function (l) {
        ul.innerHTML = (l.length ? l.map(function (r) {
          var d = new Date(r.date), m = MOIS[d.getMonth()];
          return '<li' + (r.pdf ? ' data-pdf="' + r.pdf + '" style="cursor:pointer"' : '') + '><span><b>' + m.charAt(0).toUpperCase() + m.slice(1) + ' ' + d.getFullYear() +
            '</b><small>Club Dilerna · ' + r.montant.toFixed(2).replace('.', ',') + ' €</small></span><em>' + r.statut + (r.statut === 'Payé' ? ' ✓' : '') + '</em></li>';
        }).join('') : '<li><span><small>Pas encore de reçu</small></span></li>') + '<li class="recus-note">📩 Chaque reçu t’est aussi envoyé par e-mail.</li>';
        ul.querySelectorAll('[data-pdf]').forEach(function (li) { li.addEventListener('click', function () { window.open(li.dataset.pdf, '_blank'); }); });
      }).catch(function (x) { ul.innerHTML = '<li><span><small>' + x.message + '</small></span></li>'; });
      return;
    }

    /* Offrir le club : le vrai paiement (une seule fois, pas un abonnement) */
    if (t.matches('[data-gift-pay]')) {
      stop();
      var g = t.closest('[data-gift]'), ge = g.querySelector('[data-gift-err]');
      var pour = g.querySelector('[data-gift-pour]').value.trim(), dd = g.querySelector('[data-gift-de]').value.trim(), gm = g.querySelector('[data-gift-mail]').value.trim();
      if (!pour || !dd) { ge.textContent = 'Écris son prénom et le tien'; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(gm)) { ge.textContent = 'Ton e-mail n’a pas l’air complet'; return; }
      ge.textContent = '';
      giftEtape(g, 2); g.querySelector('[data-gift-msg]').textContent = 'On t’emmène au paiement sécurisé…'; g.querySelector('[data-gift-spin]').classList.remove('ok');
      var majg = function (x) { return x.charAt(0).toUpperCase() + x.slice(1); };
      Club.offrir(majg(dd), majg(pour), g.querySelector('[data-gift-mot]').value.trim(), gm).catch(function (x) { giftEtape(g, 1); ge.textContent = x.message; });
      return;
    }
    if (t.matches('[data-gift-share]')) {
      if (!carte) return;
      stop();
      var url = location.origin + location.pathname + '?cadeau=' + carte.code + (/[?&]reel=1/.test(location.search) ? '&reel=1' : '') + '&de=' + encodeURIComponent(carte.de);
      var txt = '🎁 ' + carte.pour + ', je t’offre 1 mois de Club Dilerna ! ' + (carte.mot ? carte.mot + ' ' : '') + '— ' + carte.de;
      if (navigator.share) navigator.share({ text: txt, url: url }).catch(function () {}); else window.open('https://wa.me/?text=' + encodeURIComponent(txt + ' ' + url), '_blank');
      return;
    }

    /* Se déconnecter : aussi sur le serveur (on laisse la maquette afficher l'écran de connexion) */
    if (t.matches('[data-cp-out]')) { Club.deconnexion(); ['dilerna-membre', 'dilerna-cagnotte', 'dilerna-roue'].forEach(function (k) { ls(k, null); }); return; }

    /* Horoscope : la date de naissance est gardée sur le serveur (une seule fois) */
    if (t.matches('[data-hz-go]')) {
      var j = +(Q('[data-hz-j]') || {}).value, mo = +(Q('[data-hz-m]') || {}).value;
      if (j && mo) Club.donnerNaissance(j, mo).catch(function () {});
      return;
    }
  }, true);

  function giftEtape(g, n) { g.querySelectorAll('[data-gift-step]').forEach(function (x) { x.hidden = x.dataset.giftStep !== String(n); }); g.scrollTop = 0; }

  /* au retour du paiement de la carte cadeau : la jolie carte avec son code, prête à envoyer */
  async function carteAchetee(sid) {
    var g = Q('[data-gift]'); if (!g) return;
    g.hidden = false; giftEtape(g, 2);
    g.querySelector('[data-gift-msg]').textContent = 'Paiement accepté ✓'; g.querySelector('[data-gift-spin]').classList.add('ok');
    try {
      var c = await Club.carteAchetee(sid);
      sansParam(['cadeau_achete']);
      carte = { code: c.code, de: c.de, pour: c.pour, mot: c.mot };
      g.querySelector('[data-gift-c-pour]').textContent = 'Pour ' + c.pour;
      g.querySelector('[data-gift-c-mot]').textContent = c.mot ? '« ' + c.mot + ' »' : '';
      g.querySelector('[data-gift-c-de]').textContent = 'De la part de ' + c.de;
      g.querySelector('[data-gift-c-code]').textContent = c.code;
      giftEtape(g, 3);
    } catch (e) { g.querySelector('[data-gift-msg]').textContent = e.message; }
  }

  /* ---------- 3 bis. Les créneaux de Marie (elle confirme toujours elle-même) ---------- */
  var CRENEAUX = [];
  function jourCourt(iso) { var d = new Date(iso); return { j: d.toLocaleDateString('fr-FR', { day: 'numeric', timeZone: 'Europe/Paris' }), m: d.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'Europe/Paris' }) }; }
  function heure(iso) { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', ' h ').replace(/ h 00$/, ' h'); }
  function jourLong(iso) { return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }); }
  function maj1(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  async function chargerCreneaux() {
    if (!estMembreConnectee()) return;
    try { CRENEAUX = await Club.creneaux(); } catch (e) { return; }
    var moi = await Club.session(), uid = moi && moi.user.id;
    quandPret(function () {
      var box = Q('[data-slots-r]'), vide = Q('.slots-vide'), al = Q('[data-alert]');
      if (!box) { var bar = Q('[data-sp="slots"] .slots-vide'); if (!bar) return; bar.insertAdjacentHTML('afterend', '<div class="slots-r" data-slots-r></div>'); box = Q('[data-slots-r]'); }
      box.innerHTML = CRENEAUX.map(function (c) {
        var d = jourCourt(c.debut), fin;
        if (c.statut === 'libre') fin = '<button type="button" class="slot-go" data-cr-veux="' + c.id + '">Je le veux</button>';
        else if (c.statut === 'demande') fin = '<span class="slot-tag attente">Demandé</span>';
        else fin = '<span class="slot-tag mine-tag">Confirmé ✓</span>';
        var sous = c.statut === 'demande' ? 'Marie va te confirmer ce créneau' : c.statut === 'confirme' ? 'C’est noté, à bientôt !' : c.note;
        return '<div class="slot slot-r' + (c.statut === 'confirme' ? ' mine' : '') + '"><div class="slot-d"><b>' + d.j + '</b><span>' + d.m + '</span></div>' +
          '<div class="slot-t"><b>' + maj1(new Date(c.debut).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'Europe/Paris' })) + ' · ' + heure(c.debut) + '</b><small>' + String(sous).replace(/</g, '&lt;') + '</small></div>' + fin + '</div>';
      }).join('');
      if (vide) vide.hidden = CRENEAUX.length > 0;
      var libres = CRENEAUX.filter(function (c) { return c.statut === 'libre'; }).length;
      if (al) {
        al.classList.toggle('cr-on', libres > 0);
        var sm = al.querySelector('.alert-txt small'); if (sm) sm.textContent = libres + (libres > 1 ? ' places viennent de se libérer' : ' place vient de se libérer');
      }
    });
  }
  function demandeCreneau(id) {
    var c = CRENEAUX.filter(function (x) { return String(x.id) === String(id); })[0]; if (!c) return;
    var v = document.createElement('div'); v.className = 'cr-voile';
    v.innerHTML = '<div class="cr-pop" role="dialog" aria-modal="true"><b>' + maj1(jourLong(c.debut)) + ' à ' + heure(c.debut) + '</b>' +
      '<p data-cr-txt>Marie va recevoir ta demande et te confirmera ce créneau. Tu veux vraiment le demander ?</p>' +
      '<button type="button" class="cr-oui" data-cr-oui>Oui, je le demande</button><button type="button" class="cr-non" data-cr-non>Non, finalement</button></div>';
    document.body.appendChild(v);
    function ferme() { v.remove(); }
    v.addEventListener('click', function (e) { if (e.target === v) ferme(); });
    v.querySelector('[data-cr-non]').onclick = ferme;
    v.querySelector('[data-cr-oui]').onclick = function () {
      var b = this, t = v.querySelector('[data-cr-txt]'); b.disabled = true; b.textContent = 'J’envoie…';
      Club.demanderCreneau(c.id).then(function () {
        t.className = ''; t.textContent = 'C’est envoyé ! Marie va te confirmer ce créneau, tu recevras aussi un e-mail.';
        b.remove(); v.querySelector('[data-cr-non]').textContent = 'Fermer';
        chargerCreneaux();
      }).catch(function (x) { t.className = 'cr-err'; t.textContent = x.message; b.remove(); v.querySelector('[data-cr-non]').textContent = 'Fermer'; chargerCreneaux(); });
    };
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cr-veux]');
    if (b) { e.preventDefault(); e.stopImmediatePropagation(); demandeCreneau(b.dataset.crVeux); return; }
    /* en ouvrant la page des créneaux, on regarde s'il y a du nouveau */
    if (e.target.closest && e.target.closest('[data-go="slots"],[data-alert]')) chargerCreneaux();
  }, true);

  /* ---------- 4. L'essai photo passe par le serveur (plus besoin de l'ordi allumé) ---------- */
  var fetch0 = window.fetch.bind(window);
  function rep(o) { return Promise.resolve(new Response(JSON.stringify(o), { status: 200, headers: { 'Content-Type': 'application/json' } })); }
  window.fetch = function (url, opts) {
    if (typeof url !== 'string' || url.indexOf('/api/') !== 0) return fetch0(url, opts);
    if (url.indexOf('/api/quota') === 0) {
      return Club.essaisRestants().then(function (q) { return rep({ left: q ? q.restant : 1, quota: q ? q.quota : 1 }); }).catch(function () { return rep({ left: 15 }); });
    }
    if (url.indexOf('/api/galerie') === 0) {
      /* « # » : la maquette ajoute « ?k=… » derrière l'adresse, qu'on renvoie hors de l'adresse signée */
      return Club.galerie().then(function (l) { return rep({ photos: l.map(function (p) { return { url: p.url + '#' }; }) }); }).catch(function () { return rep({ photos: [] }); });
    }
    if (url.indexOf('/api/essai') === 0) {
      var b = {}; try { b = JSON.parse(opts.body); } catch (e) {}
      return Club.session().then(function (s) {
        var envoi = { image: b.image, inspirations: b.inspirations, forme: b.forme, longueur: b.longueur, theme: b.theme };
        /* essai offert : on envoie toujours l'e-mail, même si le téléphone est déjà connecté à un compte qui n'est pas (encore) membre
           (sinon le serveur répond « Écris ton e-mail pour recevoir ton essai gratuit. ») */
        var essaiOffert = !!document.querySelector('.space.essai');
        if (!s || essaiOffert) { var l = json('dilerna-essai-mails') || [], d = l[l.length - 1] || {}; envoi.email = d.mail || ''; envoi.news = d.news !== false; }
        return Club.essai(envoi);
      }).then(function (d) { return rep({ image: d.image, left: d.restant }); })
        .catch(function (x) { return rep({ error: x.message }); });
    }
    return fetch0(url, opts);
  };

  /* ---------- 5. Ce qui n'a pas de sens en vrai ---------- */
  quandPret(function () {
    /* Mon compte : l'e-mail se change avec Marie ; le mot de passe se change ici */
    ['mail'].forEach(function (k) {
      var b = Q('[data-cp-open="' + k + '"]'), f = Q('[data-cp-form="' + k + '"]');
      if (b) (b.closest('li') || b).hidden = true; if (f) f.hidden = true;
    });
    var bm = Q('[data-cp-open="mdp"]'); if (bm) bm.closest('li').hidden = false;
    /* Créneaux : le message d'attente, et plus de promesse de notifications */
    var sl = Q('[data-sp="slots"] .pt-bar');
    if (sl && !Q('.slots-vide')) sl.insertAdjacentHTML('afterend', '<div class="slots-vide"><b>Aucune place libérée pour l’instant</b><p>Dès qu’une cliente annule, la place apparaît ici, en premier pour toi.</p></div>');
    var ap = Q('[data-appli] .appli-h small'); if (ap) ap.textContent = 'Comme une vraie appli, toujours à portée de main';
    /* Mon abonnement : la vraie carte, pas « Visa •••• 4242 » */
    var cc = Q('[data-carte-change] small'); if (cc) cc.textContent = 'Ta carte enregistrée';
    var ld = Q('[data-lock-ouvrir]'); if (ld) ld.hidden = true;
    ecranConnexion();
    /* tout ce qui commence par « Maquette » est un bouton de démonstration : en vrai, on le cache */
    document.querySelectorAll('button, p, small, span, div').forEach(function (el) {
      if (el.children.length < 4 && /^\s*Maquette[\s:·]/.test(el.textContent)) el.hidden = true;
    });
  });

  /* L'écran de connexion « L'Essentielle » : on garde les éléments de la maquette (ils ont déjà leurs réglages)
     et on les range dans la nouvelle mise en page */
  function ecranConnexion() {
    var lock = Q('[data-lock]'); if (!lock || lock.querySelector('.cl-carte')) return;
    var ICO_MAIL = '<svg class="cl-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>';
    var ICO_CLE = '<svg class="cl-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
    var OEIL = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    var OEIL_BARRE = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
    var titre = lock.querySelector('[data-lock-t]'), sous = lock.querySelector('[data-lock-s]'), mail = lock.querySelector('#milky-code'),
        err = lock.querySelector('[data-err]'), go = lock.querySelector('[data-unlock]'), lien = lock.querySelector('[data-lock-lien]'),
        reabo = lock.querySelector('[data-reabo]'), join = lock.querySelector('[data-space-join]'), note = join && join.closest('.space-note');

    var haut = document.createElement('div'); haut.className = 'cl-haut';
    haut.innerHTML = '<img class="cl-logo" src="logo-dilerna.webp" alt="Dilerna, nail artist" width="122" height="47">' +
      '<span class="cl-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 18 2.5 8l5 4.2L12 5l4.5 7.2 5-4.2-1 10z"/></svg>Club Dilerna</span>';
    titre.className = 'cl-titre'; sous.className = 'cl-sous';
    haut.appendChild(titre); haut.appendChild(sous);

    var carte = document.createElement('form'); carte.className = 'cl-carte'; carte.setAttribute('novalidate', '');
    carte.addEventListener('submit', function (e) { e.preventDefault(); go.click(); });
    var lMail = document.createElement('label'); lMail.className = 'cl-champ'; lMail.innerHTML = ICO_MAIL;
    mail.placeholder = ' '; mail.removeAttribute('aria-label'); mail.setAttribute('inputmode', 'email'); mail.setAttribute('autocapitalize', 'off');
    lMail.appendChild(mail); lMail.insertAdjacentHTML('beforeend', '<em>E-mail</em>');
    var lMdp = document.createElement('label'); lMdp.className = 'cl-champ';
    lMdp.innerHTML = ICO_CLE + '<input type="password" id="club-mdp" autocomplete="current-password" placeholder=" "><em>Mot de passe</em>' +
      '<button type="button" class="cl-oeil" aria-label="Afficher le mot de passe">' + OEIL + '</button>';
    var oeil = lMdp.querySelector('.cl-oeil');
    oeil.addEventListener('click', function () {
      var i = lMdp.querySelector('input'), voir = i.type === 'password';
      i.type = voir ? 'text' : 'password'; oeil.innerHTML = voir ? OEIL_BARRE : OEIL;
      oeil.setAttribute('aria-label', voir ? 'Cacher le mot de passe' : 'Afficher le mot de passe');
    });
    err.className = 'cl-err';
    var oubli = document.createElement('button'); oubli.type = 'button'; oubli.className = 'cl-oubli'; oubli.dataset.clubOubli = ''; oubli.textContent = 'Mot de passe oublié ?';
    go.className = 'cl-btn'; go.type = 'submit'; go.textContent = 'Me connecter';
    var sur = document.createElement('p'); sur.className = 'cl-sur';
    sur.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Connexion sécurisée';
    [lMail, lMdp, err, oubli, go, sur].forEach(function (x) { carte.appendChild(x); });

    /* « Pas encore membre ? » : le même lien qu'avant (il ouvre la fiche du club), habillé en rose poudré */
    join.className = 'cl-rejoindre';
    join.innerHTML = '<span><b>Pas encore membre ?</b><small>Rejoins le club · 16,99 € par mois, sans engagement</small></span><i aria-hidden="true">→</i>';
    reabo.className = 'cl-btn';

    var louise = document.createElement('div'); louise.className = 'cl-louise';

    lock.textContent = '';
    [haut, carte, lien, reabo, join, louise].forEach(function (x) { if (x) lock.appendChild(x); });
    if (note) note.remove();
    louiseBalade(louise, join.querySelector('i'));
  }

  /* Louise arrive en trottinant (elle laisse ses traces de pattes), s'arrête près de la flèche de « Pas encore membre ? »,
     regarde la cliente en remuant la queue, puis se dresse sur ses pattes arrière et appuie avec le museau sur la flèche :
     la flèche s'enfonce, une onde part et un petit cœur s'envole. Elle recommence toutes les quelques secondes. */
  function louiseBalade(box, fleche) {
    var src = document.querySelector('.onb-louise svg'); if (!src || !fleche) return;
    var lw = document.createElement('div'); lw.className = 'lw'; lw.appendChild(src.cloneNode(true)); box.appendChild(lw);
    var carteRose = fleche.closest('.cl-rejoindre');
    var PATTE = '<path d="M10 13.2c-3 0-5.2 1.9-5.2 3.7 0 1.4 1.4 2.1 3.1 1.6.8-.2 1.4-.2 2.2 0 1.7.5 3.1-.2 3.1-1.6 0-1.8-2.2-3.7-3.2-3.7z"/><ellipse cx="4.3" cy="9.6" rx="1.8" ry="2.3"/><ellipse cx="8" cy="6.6" rx="1.8" ry="2.4"/><ellipse cx="12" cy="6.6" rx="1.8" ry="2.4"/><ellipse cx="15.7" cy="9.6" rx="1.8" ry="2.3"/>';
    var COEUR = '<path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.3 0 5.5 3.3 4.1 6.7C19.5 16.4 12 21 12 21z"/>';
    var DRESSE = -38, ORIGINE = '24% 86%';            /* l'angle quand elle se dresse, autour de ses pattes arrière */
    lw.style.transformOrigin = ORIGINE;
    function attends(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
    function visible() {                           /* l'écran de connexion est vraiment à l'écran (pas caché derrière la fiche) */
      var ph = box.closest('[data-phone]'), lock = box.closest('[data-lock]');
      return !!(ph && ph.classList.contains('space-open') && lock && !lock.hidden && box.getBoundingClientRect().width > 0);
    }

    /* où se placer pour que son museau touche la flèche quand elle se dresse (mesuré, donc juste sur tous les téléphones) */
    function reglage() {
      var garde = lw.style.cssText, regardait = lw.classList.contains('regarde');
      lw.classList.remove('regarde');                /* la tête de profil, pour la mesurer */
      lw.getAnimations().forEach(function (a) { a.cancel(); });
      lw.style.visibility = 'hidden'; lw.style.left = '0px'; lw.style.transform = 'rotate(' + DRESSE + 'deg)';
      var tete = lw.querySelector('.lw-profil ellipse').getBoundingClientRect(), f = fleche.getBoundingClientRect(), b = box.getBoundingClientRect();
      /* le bout du museau = le bord avant de la tête */
      var nezX = tete.right - 3, nezY = tete.top + tete.height * .55, visX = f.left + 3, visY = f.top + f.height * .62;
      lw.style.cssText = garde; if (regardait) lw.classList.add('regarde');
      return { left: Math.round(visX - nezX), monte: Math.max(-26, Math.min(4, Math.round(visY - nezY))), largeur: b.width };
    }

    var x = -110, pas = 0;
    function trace() {                               /* une petite empreinte, qui s'efface doucement */
      var gauche = parseFloat(getComputedStyle(lw).left) || 0;
      var e = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      e.setAttribute('viewBox', '0 0 20 20'); e.setAttribute('class', 'cl-pas'); e.innerHTML = PATTE;
      e.style.left = (gauche + (pas % 2 ? 26 : 62)) + 'px'; e.style.bottom = (pas % 2 ? 3 : 9) + 'px';
      e.style.transform = 'rotate(90deg)'; pas++;
      box.insertBefore(e, lw);
      e.animate([{ opacity: 0 }, { opacity: .5, offset: .08 }, { opacity: .4, offset: .55 }, { opacity: 0 }], { duration: 2600, easing: 'ease-out', fill: 'forwards' })
        .finished.then(function () { e.remove(); });
    }
    function trotte(x1, ms) {
      lw.style.transform = 'scaleX(1)'; lw.classList.remove('dos'); lw.classList.add('court');
      var a = lw.animate([{ left: x + 'px' }, { left: x1 + 'px' }], { duration: ms, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'forwards' });
      var t = setInterval(trace, 105);
      x = x1;
      return a.finished.then(function () { clearInterval(t); lw.classList.remove('court'); });
    }
    function appuie(r) {                             /* elle se dresse, appuie avec le museau, et redescend */
      lw.classList.remove('regarde'); lw.classList.add('arret');
      var debout = 'translateY(' + r.monte + 'px) rotate(' + DRESSE + 'deg)';
      var a = lw.animate([
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: debout, offset: .32, easing: 'cubic-bezier(.3,.7,.4,1)' },
        { transform: 'translateY(' + (r.monte + 2) + 'px) rotate(' + (DRESSE - 4) + 'deg)', offset: .46 },   /* le petit coup de museau */
        { transform: debout, offset: .62 },
        { transform: 'translateY(0) rotate(0deg)', easing: 'cubic-bezier(.5,0,.7,.4)' }
      ], { duration: 1500 });
      setTimeout(function () {
        fleche.classList.add('appuye'); carteRose && carteRose.classList.add('touche');
        var onde = document.createElement('span'); onde.className = 'cl-onde'; fleche.appendChild(onde);
        onde.animate([{ transform: 'scale(1)', opacity: .8 }, { transform: 'scale(2.5)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).finished.then(function () { onde.remove(); });
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); c.setAttribute('viewBox', '0 0 24 24'); c.setAttribute('class', 'cl-coeur'); c.innerHTML = COEUR;
        fleche.appendChild(c);
        c.animate([{ transform: 'translateY(0) scale(.4)', opacity: 0 }, { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: .3 }, { transform: 'translateY(-30px) scale(.9)', opacity: 0 }], { duration: 1100, easing: 'ease-out' }).finished.then(function () { c.remove(); });
        setTimeout(function () { fleche.classList.remove('appuye'); carteRose && carteRose.classList.remove('touche'); }, 260);
      }, 650);
      return a.finished.then(function () { lw.classList.add('arret', 'regarde'); });
    }

    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(function () { if (!visible()) return; var r = reglage(); lw.style.left = (r.left - 14) + 'px'; lw.classList.add('arret', 'regarde'); }, 80);
      return;
    }
    /* elle arrive dès que l'écran de connexion s'affiche, et revient à chaque nouvelle ouverture */
    var enCours = false;
    function lancer() {
      if (enCours || !visible()) return;
      enCours = true;
      var r = reglage();
      (function boucle(premier) {
        if (!visible()) { enCours = false; return; }
        x = -110; lw.style.left = '-110px'; lw.classList.remove('arret', 'regarde');
        return attends(premier ? 300 : 2600)
          .then(function () { return trotte(r.left - 16, 1500); })                            /* elle arrive */
          .then(function () { lw.classList.add('arret', 'regarde'); return attends(900); })     /* elle regarde la cliente */
          .then(function () { lw.classList.remove('arret', 'regarde'); return trotte(r.left, 260); })
          .then(function () { return appuie(r); })                                               /* elle appuie sur la flèche */
          .then(function () { return attends(700); })
          .then(function () { lw.classList.remove('arret', 'regarde'); return trotte((box.clientWidth || 380) + 20, 1300); })   /* et elle repart */
          .then(function () { return boucle(false); });
      })(true).catch(function () { enCours = false; });
    }
    new MutationObserver(function () { if (!visible()) enCours = false; else setTimeout(lancer, 80); })
      .observe(document.querySelector('[data-phone]') || document.body, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
    var ph = document.querySelector('[data-phone]');
    if (ph) new MutationObserver(function () { if (!visible()) enCours = false; else setTimeout(lancer, 380); }).observe(ph, { attributes: true, attributeFilter: ['class'] });
    setTimeout(lancer, 80);
  }

  /* ---------- Le fond derrière la fiche : sur club.dilerna.fr, plus de « Ici, ton site » de la maquette ---------- */
  var CSS_DECOR = [
    'html.reel .site .placeholder { border: 0; gap: 14px; color: #6E5248; }',
    'html.reel .placeholder .dc-logo { width: 190px; height: auto; }',
    'html.reel .placeholder .dc-titre { margin: 6px 0 0; font: 400 26px/1.1 "Gloock", Georgia, serif; color: #210202; }',
    'html.reel .placeholder .dc-btn { margin-top: 6px; border: 0; border-radius: 999px; padding: 14px 26px; background: #4E2E22; color: #fff; font: 700 14.5px "DM Sans", system-ui, sans-serif; cursor: pointer; }',
    'html.reel .placeholder .dc-lien { color: #8E5E45; font-size: 13.5px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }'
  ].join('\n');
  function decor() {
    quandPret(function () {
      var phone = Q('[data-phone]'), pl = phone && phone.querySelector('.placeholder');
      if (!pl) return;
      var st = document.createElement('style'); st.textContent = CSS_DECOR; document.head.appendChild(st);
      pl.innerHTML = '<img class="dc-logo" src="logo-dilerna.webp" alt="Dilerna, nail artist" width="122" height="47">' +
        '<p class="dc-titre">Le Club Dilerna</p>' +
        '<button class="dc-btn" type="button">Ouvrir le club</button>' +
        '<a class="dc-lien" href="https://dilerna.fr/">Revenir sur dilerna.fr</a>';
      pl.querySelector('.dc-btn').addEventListener('click', function () { var b = phone.querySelector('[data-open]'); if (b) b.click(); });
      /* la barre du bas mène au vrai site */
      var liens = { Accueil: 'https://dilerna.fr/#accueil', Inspi: 'https://dilerna.fr/#nail-art', Infos: 'https://dilerna.fr/#infos' };
      phone.querySelectorAll('.tabbar a.tab').forEach(function (a) {
        var t = (a.querySelector('span:last-child') || a).textContent.trim();
        if (liens[t]) { a.href = liens[t]; a.removeAttribute('tabindex'); }
      });
      var menu = phone.querySelector('.tabbar button.tab[aria-label="Menu"]');
      if (menu) { menu.removeAttribute('tabindex'); menu.addEventListener('click', function () { location.href = 'https://dilerna.fr/'; }); }
    });
  }
  decor();

  auDemarrage().catch(function (e) { console.error('Club réel', e); });
})();
