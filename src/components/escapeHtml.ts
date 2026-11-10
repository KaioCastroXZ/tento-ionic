/** `message` do IonAlert é HTML (sanitizado): escapa nomes digitados pelo usuário para aparecerem como texto. */
export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
