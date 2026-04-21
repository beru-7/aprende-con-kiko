# -*- coding: utf-8 -*-
"""
Script para reorganizar y actualizar variables CSS en public/styles.css
"""
import os
import re

def reorganizar_css():
    """Lee y actualiza el archivo CSS con nuevas variables y comentarios"""
    
    # Ruta del archivo CSS
    css_path = 'public/styles.css'
    
    if not os.path.exists(css_path):
        print(f"Error: El archivo {css_path} no existe")
        return False
    
    # Leer el contenido del archivo
    with open(css_path, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # 1. Reemplazar :root {...}
    root_nuevo = """:root {
  /* Colores primarios */
  --primary-color: #6750a4;
  --on-primary: #ffffff;
  
  /* Colores secundarios */
  --secondary-color: #625b71;
  --on-secondary: #ffffff;
  
  /* Colores terciarios */
  --tertiary-color: #7d5260;
  --on-tertiary: #ffffff;
  
  /* Colores de error */
  --error-color: #b3261e;
  --on-error: #ffffff;
  
  /* Colores de fondo */
  --background-color: #fffbfe;
  --on-background: #1c1b1f;
  
  /* Colores de superficie */
  --surface-color: #fffbfe;
  --on-surface: #1c1b1f;
  
  /* Variables para botones */
  --btn-filled-hover: #004b7a;
  --btn-tonal-bg: #e8def8;
  --btn-tonal-bg-hover: #d8c7f0;
  --btn-text-hover: rgba(0, 0, 0, 0.08);
  
  /* Variables para trofeos */
  --trophy-bg: #fff8dc;
  --trophy-border: #ffd700;
  --trophy-text: #d4af37;
}"""
    
    # Reemplazar :root
    contenido = re.sub(
        r':root\s*\{[^}]*\}',
        root_nuevo,
        contenido,
        flags=re.DOTALL
    )
    
    # 2. Reemplazar body.dark-mode {...}
    dark_mode_nuevo = """body.dark-mode {
  /* Colores para modo oscuro */
  --primary-color: #d0bcff;
  --on-primary: #21005d;
  
  --secondary-color: #ccc7d0;
  --on-secondary: #332d41;
  
  --tertiary-color: #f4b1d5;
  --on-tertiary: #492532;
  
  --error-color: #f2b8b5;
  --on-error: #601410;
  
  --background-color: #1c1b1f;
  --on-background: #e6e1e6;
  
  --surface-color: #1c1b1f;
  --on-surface: #e6e1e6;
  
  /* Variables para botones en modo oscuro */
  --btn-filled-hover: #76b8ff;
  --btn-tonal-bg: #6f5a99;
  --btn-tonal-bg-hover: #7f6bb3;
  --btn-text-hover: rgba(255, 255, 255, 0.08);
  
  /* Variables para trofeos en modo oscuro */
  --trophy-bg: #3a3a2e;
  --trophy-border: #d4af37;
  --trophy-text: #ffd700;
}"""
    
    # Reemplazar body.dark-mode
    contenido = re.sub(
        r'body\.dark-mode\s*\{[^}]*\}',
        dark_mode_nuevo,
        contenido,
        flags=re.DOTALL
    )
    
    # 3. Actualizar .md3-btn-filled:hover
    contenido = re.sub(
        r'(\.md3-btn-filled:hover\s*\{[^}]*background-color\s*:\s*)#004b7a',
        r'\1var(--btn-filled-hover)',
        contenido,
        flags=re.DOTALL
    )
    
    # 4. Actualizar .md3-btn-tonal para usar variables
    btn_tonal_nuevo = """.md3-btn-tonal {
  background-color: var(--btn-tonal-bg);
}

.md3-btn-tonal:hover {
  background-color: var(--btn-tonal-bg-hover);
}"""
    
    contenido = re.sub(
        r'\.md3-btn-tonal\s*\{[^}]*\}(?:\s*\.md3-btn-tonal:hover\s*\{[^}]*\})?',
        btn_tonal_nuevo,
        contenido,
        flags=re.DOTALL
    )
    
    # 5. Actualizar .md3-btn-text:hover
    contenido = re.sub(
        r'(\.md3-btn-text:hover\s*\{[^}]*background-color\s*:\s*)rgba\(0,\s*0,\s*0,\s*0\.08\)',
        r'\1var(--btn-text-hover)',
        contenido,
        flags=re.DOTALL
    )
    
    # 6. Actualizar .md3-trophy-card
    trophy_card_nuevo = """.md3-trophy-card {
  background-color: var(--trophy-bg);
  border: 2px solid var(--trophy-border);
  color: var(--trophy-text);
}"""
    
    contenido = re.sub(
        r'\.md3-trophy-card\s*\{[^}]*\}',
        trophy_card_nuevo,
        contenido,
        flags=re.DOTALL
    )
    
    # Guardar el archivo actualizado
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(contenido)
    
    print(f"✓ Archivo {css_path} actualizado correctamente")
    return True

if __name__ == '__main__':
    reorganizar_css()