/* Club Dilerna : le lien entre l'appli (la maquette) et le vrai serveur (Supabase + Stripe).
   À charger après supabase-js :
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js"></script>
     <script src="club-api.js"></script>
   Tout passe par window.Club. Chaque fonction renvoie une promesse ; en cas d'erreur, elle lève
   une Error dont le message est déjà écrit pour la cliente (« Écris ton prénom et ton nom. »…). */
(function () {
  var URL_PROJET = 'https://pbmtmquqbhpqxhksuoov.supabase.co';
  var CLE_PUBLIQUE = 'sb_publishable_obv4FqLswuXPHQHHL_WvVA_mmMlDagz';   // publique par nature : la sécurité est dans la base (RLS)
  /* le lien « mot de passe oublié » revient avec #…type=recovery : on le note avant que Supabase ne l'efface */
  window.CLUB_RECUP = /type=recovery/.test(location.hash);
  var sb = window.supabase.createClient(URL_PROJET, CLE_PUBLIQUE);
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'PASSWORD_RECOVERY') window.CLUB_RECUP = true; });

  function attendre(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* appelle une fonction du serveur ; « attente » = Stripe n'a pas encore prévenu le serveur, on réessaie */
  async function serveur(nom, corps, essais) {
    for (var i = 0; i < (essais || 1); i++) {
      var r = await sb.functions.invoke(nom, { body: corps });
      var data = r.data;
      if (r.error && r.error.context && r.error.context.json) data = await r.error.context.json().catch(function () { return null; });
      if (data && data.attente) { await attendre(1500); continue; }
      if (data && data.erreur) throw new Error(data.erreur);
      if (r.error) throw new Error('Petit souci de connexion, réessaie.');
      return data;
    }
    throw new Error('Ça prend plus de temps que prévu, réessaie dans une minute.');
  }
  async function rpc(nom, args) {
    var r = await sb.rpc(nom, args || {});
    if (r.error) throw new Error(r.error.message);
    return r.data;
  }
  async function moiId() { var s = (await sb.auth.getSession()).data.session; return s ? s.user.id : null; }

  window.Club = {
    sb: sb,

    /* ---------- connexion : e-mail + mot de passe ---------- */
    session: async function () { return (await sb.auth.getSession()).data.session; },
    connexion: async function (email, motDePasse) {
      var r = await sb.auth.signInWithPassword({ email: String(email).trim().toLowerCase(), password: motDePasse });
      if (r.error) throw new Error('E-mail ou mot de passe incorrect.');
      return r.data.session;
    },
    motDePasseOublie: async function (email) {
      var r = await sb.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), { redirectTo: location.origin + '/' });   /* la page d'accueil du club (sur l'ordi : index.html renvoie vers le club) */
      if (r.error) throw new Error('Impossible d’envoyer l’e-mail, réessaie.');
    },
    nouveauMotDePasse: async function (mdp) {
      var r = await sb.auth.updateUser({ password: mdp });
      if (r.error) throw new Error('Ce mot de passe ne marche pas, choisis-en un autre (6 caractères minimum).');
    },
    /* « Mon compte » : on vérifie l'ancien mot de passe avant de le changer */
    changerMotDePasse: async function (actuel, nouveau) {
      var s = (await sb.auth.getSession()).data.session;
      if (!s) throw new Error('Connecte-toi d’abord.');
      var v = await sb.auth.signInWithPassword({ email: s.user.email, password: actuel });
      if (v.error) throw new Error('Ton mot de passe actuel n’est pas le bon');
      await window.Club.nouveauMotDePasse(nouveau);
    },
    deconnexion: function () { return sb.auth.signOut(); },

    /* ---------- inscription (Stripe Checkout, carte ou Apple Pay) ---------- */
    sAbonner: async function (prenom, nom, email, parrain) {
      var d = await serveur('inscription', { action: 'commencer', prenom: prenom, nom: nom, email: email, parrain: parrain || '' });
      location.href = d.url;                       // page de paiement Stripe
    },
    /* au retour de Stripe (?bienvenue=cs_...) : elle choisit son mot de passe, puis elle est connectée */
    finirInscription: async function (sessionId, motDePasse) {
      var d = await serveur('inscription', { action: 'finir', session_id: sessionId, mot_de_passe: motDePasse }, 20);   /* jusqu'à 30 s : le temps que Stripe prévienne le serveur */
      await window.Club.connexion(d.email, motDePasse);
      return d;                                    // { email, prenom }
    },

    /* ---------- ce que l'espace affiche ---------- */
    moi: async function () {
      var id = await moiId();
      if (!id) return null;
      var r = await Promise.all([
        sb.from('profils').select('prenom, nom, email, naissance_jour, naissance_mois, est_admin, cree_le').eq('id', id).single(),
        sb.from('abonnements').select('statut, debut, fin_periode, arret_demande, paiement_echoue_le').eq('user_id', id).maybeSingle(),
        rpc('cagnotte_solde', { uid: id }),
        sb.from('roue_tours').select('id, mois, resultat, gain_cents, utilise_le').eq('user_id', id).order('mois', { ascending: false }),
        sb.from('cagnotte').select('montant_cents, motif, cree_le').eq('user_id', id).order('cree_le')
      ]);
      return { profil: r[0].data, abonnement: r[1].data, cagnotte: r[2] / 100, tours: r[3].data || [], mouvements: r[4].data || [] };
    },
    places: function () { return rpc('places_club'); },          // { membres, vague, places, libres }
    donnerNaissance: function (jour, mois) { return rpc('donner_naissance', { jour: jour, mois: mois }); },

    /* ---------- la roue (tirage sur le serveur) ---------- */
    tournerRoue: function () { return rpc('tourner_roue'); },     // { deja, resultat: '-1 €'|'-5 €'|'-10 €'|'Perdu'|'Pose offerte', cagnotte_cents }

    /* ---------- les créneaux libérés (pas de réservation automatique : Marie confirme) ---------- */
    creneaux: async function () {                                  // [{ id, debut, note, statut, demande_par }] à venir
      var r = await sb.from('creneaux').select('id, debut, note, statut, demande_par').in('statut', ['libre', 'demande', 'confirme'])
        .gt('debut', new Date().toISOString()).order('debut');
      if (r.error) throw new Error(r.error.message);
      return r.data || [];
    },
    demanderCreneau: function (id) { return serveur('creneaux', { action: 'demander', id: id }); },

    /* ---------- les classements (jeu : 0 quiz, 1 gouttes, 2 flacons, 3 limes, 4 grilles) ---------- */
    jouer: function (jeu, score, temps, pseudo) {                 // enregistre le score et renvoie [{ p, s, t, moi }] du mois
      return rpc('jouer', { p_jeu: jeu, p_score: score == null ? null : Math.round(score), p_temps: temps == null ? null : Math.round(temps), p_pseudo: pseudo || null });
    },

    /* ---------- essai photo ---------- */
    essai: function (opts) { return serveur('essai-photo', opts); },   // { image, inspirations, forme, longueur, theme, email?, news? } -> { image, restant }
    essaisRestants: async function () {
      var id = await moiId();
      if (!id) return null;
      var d = new Date(), debut = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      var r = await Promise.all([sb.from('essais').select('id', { count: 'exact', head: true }).eq('user_id', id).gte('cree_le', debut),
                                 sb.from('reglages').select('essais_par_mois').eq('id', 1).single()]);
      var quota = (r[1].data && r[1].data.essais_par_mois) || 15;
      return { quota: quota, restant: Math.max(0, quota - (r[0].count || 0)) };
    },
    galerie: async function () {
      var id = await moiId();
      if (!id) return [];
      var l = await sb.storage.from('essais').list(id, { limit: 200, sortBy: { column: 'name', order: 'desc' } });
      if (l.error || !l.data.length) return [];
      var s = await sb.storage.from('essais').createSignedUrls(l.data.map(function (f) { return id + '/' + f.name; }), 3600);
      return (s.data || []).map(function (x) { return { url: x.signedUrl, nom: x.path }; });
    },

    /* ---------- mon abonnement ---------- */
    changerCarte: async function () { location.href = (await serveur('mon-abonnement', { action: 'carte' })).url; },
    maCarte: async function () { return (await serveur('mon-abonnement', { action: 'infos' })).carte; },   // { marque, fin } ou null
    recus: async function () { return (await serveur('mon-abonnement', { action: 'recus' })).recus; },
    seDesabonner: async function () { return (await serveur('mon-abonnement', { action: 'arreter' })).fin; },
    resterMembre: async function () { return (await serveur('mon-abonnement', { action: 'reprendre' })).fin; },

    /* ---------- cartes cadeaux ---------- */
    offrir: async function (de, pour, mot, email) {
      location.href = (await serveur('carte-cadeau', { action: 'acheter', de: de, pour: pour, mot: mot, email: email })).url;
    },
    carteAchetee: function (sessionId) { return serveur('carte-cadeau', { action: 'voir', session_id: sessionId }, 8); },
    activerCadeau: async function (code, prenom, nom, email, motDePasse) {
      var d = await serveur('carte-cadeau', { action: 'activer', code: code, prenom: prenom, nom: nom, email: email, mot_de_passe: motDePasse });
      if (!d.deja_compte) await window.Club.connexion(d.email, motDePasse);
      return d;                                    // { email, deja_compte? }
    },

    /* ---------- Espace Marie ---------- */
    marie: {
      /* tout l'espace en un appel (+ les adresses des photos d'essais, valables 1 h) */
      tableau: async function () {
        var t = await rpc('marie_tableau');
        var chemins = t.essais.map(function (e) { return e.fichier; });
        t.clientes.forEach(function (c) { if (c.essai) chemins.push(c.essai.fichier); });
        chemins = chemins.filter(function (x, i) { return chemins.indexOf(x) === i; });
        var urls = {};
        if (chemins.length) {
          var s = await sb.storage.from('essais').createSignedUrls(chemins, 3600);
          (s.data || []).forEach(function (x) { if (x.signedUrl) urls[x.path] = x.signedUrl; });
        }
        t.essais.forEach(function (e) { e.url = urls[e.fichier] || ''; });
        t.clientes.forEach(function (c) { if (c.essai) c.essai.url = urls[c.essai.fichier] || ''; });
        return t;
      },
      estAdmin: async function () { try { return !!(await rpc('est_admin')); } catch (e) { return false; } },
      clientes: async function () {
        var r = await sb.from('profils').select('id, prenom, nom, email, naissance_jour, naissance_mois, cree_le, abonnements(statut, debut, fin_periode, arret_demande, paiement_echoue_le)');
        return r.data || [];
      },
      aFaire: async function () { return (await sb.from('a_faire').select('*').order('depuis')).data || []; },
      historique: async function (n) { return (await sb.from('evenements').select('type, texte, cree_le').order('cree_le', { ascending: false }).limit(n || 50)).data || []; },
      essaisGratuits: async function () { return (await sb.from('essais_gratuits').select('*').order('cree_le', { ascending: false })).data || []; },
      cartesCadeaux: async function () { return (await sb.from('cartes_cadeaux').select('*').order('cree_le', { ascending: false })).data || []; },
      ajouterCreneau: function (debut, note) { return serveur('creneaux', { action: 'ajouter', debut: debut, note: note }); },
      enleverCreneau: function (id) { return serveur('creneaux', { action: 'enlever', id: id }); },
      repondreCreneau: function (id, oui) { return serveur('creneaux', { action: 'repondre', id: id, oui: !!oui }); },
      utiliserCagnotte: function (cliente, euros) { return rpc('utiliser_cagnotte', { cliente: cliente, cents: Math.round(euros * 100) }); },
      marquerFait: function (quoi, cliente, ref) { return rpc('marquer_fait', { quoi: quoi, cliente: cliente, ref: ref || null }); },
      lierMarraine: function (filleule, marraine) { return rpc('lier_marraine', { filleule: filleule, marraine: marraine }); },
      /* les nouveautés arrivent toutes seules (historique en direct) */
      enDirect: function (quandNouveau) {
        return sb.channel('historique').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'evenements' },
          function (p) { quandNouveau(p.new); }).subscribe();
      }
    }
  };
})();
