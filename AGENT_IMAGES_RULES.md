# 🖼️ Règles Images — NeonActu

> **Règle critique pour l'agent :** Quand tu crées un `_jeu.json` ou un article avec un `cover`, vérifie TOUJOURS que l'image existe et est accessible.

## ❌ Problèmes à éviter

### 1. URLs PlayStation bidons
Ne JAMAIS inventer un hash PlayStation. Exemple de ce qu'il ne faut PAS faire :
```json
"cover": "https://image.api.playstation.com/vulcan/ap/rnd/202501/0609/4a96cbe6...abc123.jpg"
```
Cette URL avec un hash `abcdef...` était un **placeholder bidon** qui ne renvoyait rien.

### 2. Placeholder local corrompu
Ne pas créer de fichier `.jpg` de 18 octets contenant du texte :
```
PLACEHOLDER_BASE64
```
Le fichier `public/images/the-blood-of-dawnwalker-cover.jpg` (18 octets) était corrompu.

### 3. Hotlink bloqué
Les URLs PlayStation (`image.api.playstation.com`, `gmedia.playstation.com`) peuvent bloquer le hotlink selon le `Referer`. Préférer des CDN de presse gaming.

## ✅ Bonnes pratiques

### URLs fiables (par ordre de préférence)

1. **Steam Store** — `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg`
   - Très fiable, jamais de blocage
   - Format : 460×215 (header) ou 1920×620 (library)
   - Exemple : `https://cdn.akamai.steamstatic.com/steam/apps/2399780/header.jpg`

2. **Eurogamer / assetsio** — `https://assetsio.gnwcdn.com/{slug}-header-art.jpg`
   - Grand format (1920×1080)
   - Accepte les paramètres `?width=1920&height=1080&fit=bounds&quality=85&format=jpg`
   - Exemple : `https://assetsio.gnwcdn.com/blood-of-dawnwalker-header-art.jpg?width=1920&height=1080&fit=bounds&quality=85&format=jpg&auto=webp`

3. **IGN** — `https://assets-prd.ignimgs.com/...`
   - Fiable mais URL moins prévisible

4. **PlayStation CDN direct** — `https://image.api.playstation.com/...`
   - À utiliser en dernier recours
   - Risque de blocage hotlink

### Images locales (`/public/images/`)

Si tu uploades une image locale :
- Encoder en **base64** et push via GitHub API
- Vérifier que le fichier est bien un JPEG/PNG valide (pas un SVG déguisé)
- Utiliser le chemin `/images/nom-du-jeu-cover.jpg` dans le JSON

### Vérification avant push

Pour CHAQUE `cover` dans `_jeu.json` ou article :
```bash
# Vérifier que l'URL renvoie un image valide
curl -sI "URL" | grep -i "content-type: image"

# Vérifier que ce n'est pas un SVG déguisé
file /tmp/image.jpg
```

## 📋 Checklist agent

- [ ] L'URL de `cover` est-elle une vraie image ? (pas un placeholder)
- [ ] Le fichier local est-il > 1 Ko ? (pas du texte)
- [ ] L'image est-elle accessible publiquement ? (pas de 403)
- [ ] Le format est-il JPEG ou PNG ? (pas SVG pour un cover)
- [ ] Y a-t-il un crédit si c'est une capture officielle ?

---
*Dernière mise à jour : 8 septembre 2026*
