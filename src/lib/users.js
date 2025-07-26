// src/lib/users.js

// To jest nasza mała, wewnętrzna baza danych e-maili i imion.
const userMap = {
  // PRZYKŁAD - ZASTĄP PRAWDZIWYMI DANYMI
  'cinekadrych@gmail.com': 'Marian - Hydraulik amator',
  'jarekadrych321@gmail.com': 'Jarek - Szef',
  'mateuszadrych@o2.pl': 'Mateusz - Kiełownik',
  'gdaniec55@gmail.com': 'Marek - Hydraulik, 15 lat doświadczenia (z nadgodzinami)',
  'jozef.nalborski@wp.pl': 'Józio - Instalator',
  'dawid1685.2002@wp.pl': 'Dawid - W ogłoszeniu chcieli brukarza nie hydraulika..',
};

// Ta funkcja będzie tłumaczyć e-mail na imię.
export const getUserName = (email) => {
  if (!email) return 'Nieznany';
  // Jeśli e-mail jest w naszej mapie, zwróć imię.
  // W przeciwnym wypadku, zwróć część e-maila przed znakiem @.
  return userMap[email.toLowerCase()] || email.split('@')[0];
};