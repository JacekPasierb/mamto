import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/LegalPageShell";
import {LEGAL} from "@/lib/legal";

export default function PolitykaPrywatnosciPage() {
  return (
    <LegalPageShell title="Polityka prywatności">
      <LegalSection title="1. Administrator danych">
        <p>
          Administratorem danych osobowych Użytkowników Usługi{" "}
          <strong>{LEGAL.appName}</strong> jest{" "}
          <strong>{LEGAL.operatorName}</strong>
          {LEGAL.operatorForm ? ` (${LEGAL.operatorForm})` : ""}, adres:{" "}
          {LEGAL.operatorAddress}
          {LEGAL.operatorNip ? `, NIP: ${LEGAL.operatorNip}` : ""}. Kontakt w
          sprawach ochrony danych:{" "}
          <a href={`mailto:${LEGAL.operatorEmail}`}>{LEGAL.operatorEmail}</a>.
        </p>
        <p>
          Polityka opisuje zasady przetwarzania danych zgodnie z RODO
          (Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679) oraz
          polskimi przepisami o ochronie danych osobowych.
        </p>
      </LegalSection>

      <LegalSection title="2. Jakie dane przetwarzamy">
        <p>W zależności od sposobu korzystania z Usługi możemy przetwarzać:</p>
        <ul>
          <li>
            <strong>dane konta</strong> — adres e-mail, imię (jeśli podane),
            identyfikatory sesji / konta u dostawcy logowania,
          </li>
          <li>
            <strong>dane treści Użytkownika</strong> — informacje wprowadzone w
            Aplikacji (m.in. pojazdy i serwis, polisy, dokumenty osobiste i ich
            daty ważności, zapasy, ustawienia modułów, notatki),
          </li>
          <li>
            <strong>dane techniczne</strong> — adres IP, dane przeglądarki,
            logi bezpieczeństwa i diagnostyczne, pliki cookies (szczegóły w{" "}
            <Link href="/cookies">Polityce cookies</Link>),
          </li>
          <li>
            <strong>dane płatności</strong> — jeśli uruchomimy płatności: dane
            rozliczeniowe przetwarzane głównie przez operatora płatności (nie
            przechowujemy pełnych numerów kart).
          </li>
        </ul>
        <p>
          Nie wymagamy podawania danych wrażliwych w rozumieniu art. 9 RODO.
          Jeśli Użytkownik dobrowolnie umieści w notatkach lub zapasach informacje
          o charakterze zdrowotnym, przetwarza je na własną odpowiedzialność —
          Administrator przetwarza je wyłącznie jako treść Konta w celu
          świadczenia Usługi.
        </p>
      </LegalSection>

      <LegalSection title="3. Cele i podstawy prawne">
        <ul>
          <li>
            <strong>świadczenie Usługi i prowadzenie Konta</strong> — art. 6
            ust. 1 lit. b RODO (umowa),
          </li>
          <li>
            <strong>bezpieczeństwo, przeciwdziałanie nadużyciom, logi</strong> —
            art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes),
          </li>
          <li>
            <strong>obowiązki prawne</strong> (np. rachunkowość, odpowiedzi na
            żądania organów) — art. 6 ust. 1 lit. c RODO,
          </li>
          <li>
            <strong>marketing własny / komunikacja</strong> — za zgodą lub w
            oparciu o prawnie uzasadniony interes, z prawem sprzeciwu; zgoda —
            art. 6 ust. 1 lit. a RODO,
          </li>
          <li>
            <strong>cookies niepotrzebne</strong> — na podstawie zgody (szczegóły
            w Polityce cookies).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Odbiorcy i podmioty przetwarzające">
        <p>
          Dane mogą być powierzane zaufanym dostawcom działającym na nasze
          zlecenie (art. 28 RODO), w szczególności:
        </p>
        <ul>
          {LEGAL.processors.map((processor) => (
            <li key={processor.name}>
              <strong>{processor.name}</strong> — {processor.role} (region:{" "}
              {processor.region})
            </li>
          ))}
        </ul>
        <p>
          Dane mogą być ujawniane organom uprawnionym na podstawie przepisów
          prawa.
        </p>
      </LegalSection>

      <LegalSection title="5. Przekazywanie poza EOG">
        <p>
          Część dostawców (np. Clerk) może przetwarzać dane poza Europejskim
          Obszarem Gospodarczym. W takich przypadkach stosujemy mechanizmy
          zgodne z RODO (m.in. standardowe klauzule umowne, decyzje o
          adekwatności), o ile są wymagane.
        </p>
      </LegalSection>

      <LegalSection title="6. Okres przechowywania">
        <ul>
          <li>
            dane Konta i Treści Użytkownika — przez czas posiadania Konta oraz
            przez okres niezbędny po usunięciu Konta (np. rozliczenia, obrona
            roszczeń, obowiązki prawne),
          </li>
          <li>
            logi techniczne — zwykle do 12–24 miesięcy, chyba że dłuższy okres
            wynika z bezpieczeństwa lub prawa,
          </li>
          <li>
            dane rozliczeniowe — zgodnie z przepisami podatkowymi i
            rachunkowymi.
          </li>
        </ul>
        <p>
          Użytkownik może w każdej chwili usunąć Konto lub wybrane treści w
          zakresie przewidzianym w Aplikacji; żądanie usunięcia danych można też
          zgłosić e-mailem.
        </p>
      </LegalSection>

      <LegalSection title="7. Prawa Użytkownika">
        <p>Przysługuje Ci m.in. prawo do:</p>
        <ul>
          <li>dostępu do danych,</li>
          <li>sprostowania danych,</li>
          <li>usunięcia danych („prawo do bycia zapomnianym”),</li>
          <li>ograniczenia przetwarzania,</li>
          <li>przenoszenia danych,</li>
          <li>sprzeciwu wobec przetwarzania opartego na art. 6 ust. 1 lit. f,</li>
          <li>cofnięcia zgody (jeśli przetwarzanie opiera się na zgodzie),</li>
          <li>
            wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych
            (UODO).
          </li>
        </ul>
        <p>
          Aby skorzystać z praw, napisz na{" "}
          <a href={`mailto:${LEGAL.operatorEmail}`}>{LEGAL.operatorEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="8. Bezpieczeństwo">
        <p>
          Stosujemy środki organizacyjne i techniczne adekwatne do ryzyka
          (m.in. szyfrowanie połączeń HTTPS, kontrola dostępu, rozdzielenie
          środowisk). Żaden system nie daje jednak 100% gwarancji
          bezpieczeństwa — zachęcamy do silnych haseł i ochrony urządzenia.
        </p>
      </LegalSection>

      <LegalSection title="9. Dane dzieci">
        <p>
          Usługa nie jest kierowana do osób poniżej 16. roku życia. Nie
          zbieramy świadomie danych dzieci. W razie stwierdzenia takiego
          przypadku dane zostaną usunięte.
        </p>
      </LegalSection>

      <LegalSection title="10. Zmiany Polityki">
        <p>
          Polityka może być aktualizowana. Nowa wersja będzie publikowana pod
          tym adresem z datą obowiązywania. W razie istotnych zmian
          poinformujemy Użytkowników w rozsądny sposób.
        </p>
        <p>
          Aktualna wersja:{" "}
          <Link href="/polityka-prywatnosci">
            {LEGAL.siteUrl}/polityka-prywatnosci
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
