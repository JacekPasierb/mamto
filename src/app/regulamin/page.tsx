import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/LegalPageShell";
import {LEGAL} from "@/lib/legal";

export default function RegulaminPage() {
  return (
    <LegalPageShell title="Regulamin świadczenia usług">
      <LegalSection title="1. Postanowienia ogólne">
        <p>
          Niniejszy Regulamin określa zasady korzystania z aplikacji i serwisu
          internetowego <strong>{LEGAL.appName}</strong> („Usługa”, „Aplikacja”),
          dostępnego pod adresem {LEGAL.siteUrl} oraz w powiązanych domenach.
        </p>
        <p>
          Usługodawcą i administratorem Usługi jest{" "}
          <strong>{LEGAL.operatorName}</strong>
          {LEGAL.operatorForm ? ` (${LEGAL.operatorForm})` : ""}, z siedzibą:{" "}
          {LEGAL.operatorAddress}
          {LEGAL.operatorNip ? `, NIP: ${LEGAL.operatorNip}` : ""}.
          Kontakt:{" "}
          <a href={`mailto:${LEGAL.operatorEmail}`}>{LEGAL.operatorEmail}</a>
          {LEGAL.operatorPhone ? `, tel. ${LEGAL.operatorPhone}` : ""}.
        </p>
        <p>
          Korzystanie z Usługi oznacza zapoznanie się z Regulaminem oraz
          Polityką prywatności i ich akceptację w zakresie wymaganym przepisami
          prawa oraz na etapie rejestracji konta.
        </p>
      </LegalSection>

      <LegalSection title="2. Definicje">
        <ul>
          <li>
            <strong>Użytkownik</strong> — osoba fizyczna posiadająca pełną
            zdolność do czynności prawnych, która utworzyła Konto lub korzysta
            z Usługi.
          </li>
          <li>
            <strong>Konto</strong> — indywidualne konto Użytkownika w Usłudze,
            zabezpieczone danymi logowania.
          </li>
          <li>
            <strong>Treści Użytkownika</strong> — dane i informacje
            wprowadzane przez Użytkownika (m.in. pojazdy, polisy, dokumenty
            osobiste, zapasy, ustawienia).
          </li>
          <li>
            <strong>Konsument</strong> — Użytkownik będący konsumentem w
            rozumieniu przepisów polskiego prawa.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Charakter Usługi">
        <p>
          {LEGAL.appName} to organizer życia — narzędzie do samodzielnego
          zarządzania przypomnieniami i informacjami dotyczącymi m.in. pojazdów,
          ubezpieczeń, dokumentów osobistych, zapasów oraz wizyt.
        </p>
        <p>
          Usługa ma charakter <strong>informacyjno-organizacyjny</strong>. Nie
          stanowi poradnictwa prawnego, medycznego, finansowego ani gwarancji
          dotrzymania terminów wobec osób trzecich (urzędy, ubezpieczyciele,
          warsztaty itd.). Użytkownik ponosi odpowiedzialność za weryfikację
          dat i obowiązków wynikających z przepisów lub umów.
        </p>
      </LegalSection>

      <LegalSection title="4. Wymagania techniczne">
        <p>
          Do korzystania z Usługi potrzebne są: urządzenie z dostępem do
          Internetu, aktualna przeglądarka internetowa oraz aktywny adres
          e-mail. Część funkcji wymaga zalogowanego Konta.
        </p>
      </LegalSection>

      <LegalSection title="5. Rejestracja i Konto">
        <ol>
          <li>
            Rejestracja wymaga podania prawdziwych danych niezbędnych do
            utworzenia Konta (w tym adresu e-mail) oraz akceptacji Regulaminu i
            Polityki prywatności.
          </li>
          <li>
            Użytkownik zobowiązuje się chronić dane logowania i nie udostępniać
            Konta osobom trzecim.
          </li>
          <li>
            Uwierzytelnianie może być realizowane także przez zewnętrznych
            dostawców tożsamości (np. Google) — w zakresie ich regulaminów.
          </li>
          <li>
            Usługodawca może zawiesić lub usunąć Konto w przypadku naruszenia
            Regulaminu, przepisów prawa lub bezpieczeństwa Usługi.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="6. Zasady korzystania">
        <p>Użytkownik zobowiązuje się w szczególności do:</p>
        <ul>
          <li>korzystania z Usługi zgodnie z prawem i dobrymi obyczajami,</li>
          <li>
            niewprowadzania treści bezprawnych, obraźliwych ani naruszających
            prawa osób trzecich,
          </li>
          <li>
            niepodejmowania działań zakłócających działanie Usługi (w tym
            nieautoryzowanych prób dostępu),
          </li>
          <li>
            niewykorzystywania Usługi do celów innych niż przewidziane w
            Regulaminie.
          </li>
        </ul>
        <p>
          Treści Użytkownika pozostają jego własnością. Użytkownik udziela
          Usługodawcy niewyłącznej licencji na ich przetwarzanie techniczne w
          zakresie niezbędnym do świadczenia Usługi.
        </p>
      </LegalSection>

      <LegalSection title="7. Płatności i plany (jeśli dostępne)">
        <p>
          Usługa może być oferowana w modelu darmowym i/lub płatnym. Szczegóły
          cen, okresów rozliczeniowych i zakresu funkcji płatnych — jeśli
          zostaną wprowadzone — będą publikowane w Aplikacji lub na stronie
          Usługi przed zawarciem umowy o charakterze odpłatnym.
        </p>
        <p>
          W przypadku usług cyfrowych dostarczanych konsumentowi zastosowanie
          mają przepisy o odstąpieniu od umowy i wyjątkach przewidzianych
          prawem (m.in. gdy spełnianie świadczenia rozpoczęło się za wyraźną
          zgodą konsumenta przed upływem terminu odstąpienia).
        </p>
      </LegalSection>

      <LegalSection title="8. Odpowiedzialność">
        <ul>
          <li>
            Usługodawca dokłada starań, aby Usługa działała poprawnie, jednak
            nie gwarantuje nieprzerwanej dostępności (przerwy techniczne,
            awarie, działania siły wyższej).
          </li>
          <li>
            Usługodawca nie odpowiada za szkody wynikłe z nieprawidłowych danych
            wprowadzonych przez Użytkownika, braku działania Użytkownika mimo
            przypomnienia, ani za decyzje podjęte wyłącznie na podstawie Usługi.
          </li>
          <li>
            W stosunku do Konsumentów ograniczenia odpowiedzialności stosuje się
            wyłącznie w granicach dopuszczonych przepisami prawa.
          </li>
          <li>
            Maksymalna odpowiedzialność Usługodawcy wobec Użytkownika niebędącego
            Konsumentem z tytułu niewykonania lub nienależytego wykonania
            umowy ogranicza się — w zakresie dozwolonym prawem — do kwoty
            faktycznie zapłaconej przez Użytkownika za Usługę w okresie 12
            miesięcy poprzedzających zdarzenie (lub do 0 zł, jeśli Usługa była
            bezpłatna).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Własność intelektualna">
        <p>
          Nazwa {LEGAL.appName}, logo, układ interfejsu, kod i materiały
          Usługodawcy są chronione prawem. Zabronione jest kopiowanie,
          modyfikowanie i rozpowszechnianie elementów Usługi bez zgody, poza
          dozwolonym użytkiem wynikającym z przepisów.
        </p>
      </LegalSection>

      <LegalSection title="10. Reklamacje">
        <p>
          Reklamacje dotyczące Usługi należy zgłaszać na adres{" "}
          <a href={`mailto:${LEGAL.operatorEmail}`}>{LEGAL.operatorEmail}</a>,
          wskazując opis problemu oraz dane kontaktowe. Usługodawca rozpatrzy
          reklamację bez zbędnej zwłoki, nie później niż w terminie 14 dni,
          o ile przepisy szczególne nie stanowią inaczej.
        </p>
        <p>
          Konsument może skorzystać z pozasądowych sposobów rozpatrywania
          sporów, w tym platformy ODR:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="11. Zmiany Regulaminu">
        <p>
          Usługodawca może zmienić Regulamin z ważnych przyczyn (zmiana prawa,
          funkcji Usługi, bezpieczeństwa, modelu rozliczeń). O istotnych
          zmianach Użytkownicy zostaną poinformowani z odpowiednim wyprzedzeniem
          (np. e-mail lub komunikat w Aplikacji). Dalsze korzystanie z Usługi po
          wejściu zmian w życie może oznaczać ich akceptację — z zastrzeżeniem
          uprawnień Konsumenta do rozwiązania umowy.
        </p>
      </LegalSection>

      <LegalSection title="12. Prawo właściwe">
        <p>
          Do Regulaminu i umowy o świadczenie Usługi stosuje się prawo polskie.
          Właściwość sądów określa się zgodnie z przepisami powszechnie
          obowiązującymi; w stosunku do Konsumentów — z uwzględnieniem
          przepisów o ochronie konsumentów.
        </p>
      </LegalSection>

      <LegalSection title="13. Postanowienia końcowe">
        <p>
          W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego,
          w tym Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą
          elektroniczną. Aktualna wersja Regulaminu jest dostępna pod adresem{" "}
          <Link href="/regulamin">{LEGAL.siteUrl}/regulamin</Link>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
