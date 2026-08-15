import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/LegalPageShell";
import {LEGAL} from "@/lib/legal";

export default function CookiesPage() {
  return (
    <LegalPageShell title="Polityka plików cookies">
      <LegalSection title="1. Czym są cookies">
        <p>
          Pliki cookies (i podobne technologie, np. local storage) to małe
          informacje zapisywane na urządzeniu Użytkownika. Ułatwiają działanie
          serwisu, zapamiętują preferencje i — jeśli wyrazisz zgodę — pomagają
          analizować ruch.
        </p>
      </LegalSection>

      <LegalSection title="2. Jakich cookies używamy">
        <ul>
          <li>
            <strong>Niezbędne</strong> — wymagane do działania Usługi: sesja
            logowania (Clerk), bezpieczeństwo, zapamiętanie podstawowych
            ustawień (np. zgody na cookies). Bez nich Aplikacja nie działa
            poprawnie. Podstawa: prawnie uzasadniony interes / wykonanie umowy.
          </li>
          <li>
            <strong>Funkcjonalne / preferencje</strong> — opcjonalne, jeśli
            zostaną wdrożone (np. zapamiętanie wyboru języka). Podstawa: zgoda.
          </li>
          <li>
            <strong>Analityczne / marketingowe</strong> — opcjonalne; obecnie
            możemy ich nie używać. Jeśli je włączymy, poinformujemy w bannerze
            i poprosimy o zgodę.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Zarządzanie zgodą">
        <p>
          Przy pierwszej wizycie możesz zaakceptować lub odrzucić cookies
          opcjonalne w bannerze. Preferencję zapisujemy lokalnie w przeglądarce.
          Możesz też wyczyścić cookies w ustawieniach przeglądarki — może to
          wpłynąć na logowanie i działanie Usługi.
        </p>
      </LegalSection>

      <LegalSection title="4. Dostawcy zewnętrzni">
        <p>
          W ramach logowania i bezpieczeństwa cookies mogą pochodzić od
          dostawców wskazanych w{" "}
          <Link href="/polityka-prywatnosci">Polityce prywatności</Link>{" "}
          (m.in. Clerk). Zakres zależy od ich dokumentacji.
        </p>
      </LegalSection>

      <LegalSection title="5. Kontakt">
        <p>
          Pytania:{" "}
          <a href={`mailto:${LEGAL.operatorEmail}`}>{LEGAL.operatorEmail}</a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
