# 🛒 Gestiune Magazin(SmartMag) - Frontend

Frontend-ul aplicației de gestiune pentru companii și magazine, construit cu **React JS + Vite**. Această aplicație permite gestionarea produselor, utilizatorilor, turelor, concediilor și stocurilor din magazine, cu un UI modern și responsive.

## 🔗 Tehnologii

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Keycloak JS](https://www.keycloak.org/)

---

## 🚀 Funcționalități principale

- Autentificare cu Keycloak (inclusiv Google login)
- Dashboard pentru fiecare tip de utilizator: OWNER / MANAGER / ANGAJAT
- Gestiune companie și magazine
- Vizualizare și modificare produse + stocuri
- Programare și schimb ture
- Cereri de concediu / învoire
- Upload fișiere asociate entităților (PDF, imagini)
- Notificări în timp real (WebSocket)
- Loguri de audit pentru acțiuni importante

---

## 🧑‍💻 Roluri utilizator

| Rol       | Permisiuni                                                 |
|-----------|-------------------------------------------------------------|
| OWNER     | Creează compania, magazine, utilizatori, vizualizează tot  |
| MANAGER   | Gestiune utilizatori și program, aprobare cereri, inventar |
| ANGAJAT   | Vizualizează turele, poate solicita concediu/schimb tură   |

---

## 📦 Instalare

```bash
git clone https://github.com/numele-tau/gestiune-magazin-fe.git
cd gestiune-magazin-fe
npm install
npm run dev
```