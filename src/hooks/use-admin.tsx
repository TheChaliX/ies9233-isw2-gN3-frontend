import { createContext, useContext, useState, type ReactNode } from 'react';

// Contraseña única de los administradores. Se cambia en .env.local con EXPO_PUBLIC_ADMIN_PASSWORD
// (después de cambiarla hay que reiniciar Expo).
// Ojo: queda dentro del código de la app. Para el TP alcanza, pero la protección real va en el backend.
const PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD ?? 'pipicucu';

type Admin = {
  esAdmin: boolean;
  entrar: (clave: string) => boolean; // true si la contraseña es correcta
  salir: () => void;
};

const AdminContext = createContext<Admin>({ esAdmin: false, entrar: () => false, salir: () => {} });

// Se pone una sola vez en _layout.tsx. El modo admin dura mientras la app esté abierta.
export function AdminProvider({ children }: { children: ReactNode }) {
  const [esAdmin, setEsAdmin] = useState(false);

  function entrar(clave: string) {
    const ok = clave === PASSWORD;
    if (ok) setEsAdmin(true);
    return ok;
  }

  return (
    <AdminContext.Provider value={{ esAdmin, entrar, salir: () => setEsAdmin(false) }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
