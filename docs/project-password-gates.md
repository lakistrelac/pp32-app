# Zaštita dva projekta zasebnim šiframa — plan implementacije

Status: PRIPREMA; ne uključivati u produkciju pre server-side zaštite i testiranja.

## Projekti
- pp32 — Projekat podizanja osiguranja 32 putna prelaza
- cvetojevac-sobovica — Projekat izgradnje nove pruge Cvetojevac–Sobovica

## Zahtevi
- Isključivo aktivni admin ulazi bez projektne šifre.
- Lider, gost i ostale dozvoljene uloge unose šifru zasebno za svaki projekat.
- Novo logovanje i svaki reload zahtevaju novu proveru.
- Pristup drugom projektu zahteva njegovu šifru.
- Admin postavlja/menja šifre kroz UI, bez slanja šifara u GitHub/ChatGPT.
- Bez novih plaćenih servisa.

## Bezbednosni uslovi pre aktiviranja
1. Lozinke se heširaju na serveru (pgcrypto/bcrypt), nikada se ne šalju nazad klijentu.
2. Provera kroz autorizovani server-side RPC sa ograničenjem broja pokušaja.
3. Kratkotrajni projektni grant samo u memoriji kartice; ne u localStorage/sessionStorage.
4. Grant mora da bude proveravan server-side za svako čitanje i izmenu podataka, kao i Storage dokumente; samo frontend modal NIJE zaštita.
5. Pregledati sve RLS politike za projects, rlcs, components, component_tasks, diary_entries, documents, equipment_items, rlc_line_items, rlc_cable_items, project_segments, project_elements, project_element_tasks, project_diary_entries, project_documents, project_equipment_items, project_remarks, project_cable_plans i Storage.
6. Direktan REST API poziv bez važećeg granta ne sme da otkrije projektne podatke; admin izuzetak proveravati iz zaštićenog profila.
7. Izbegavati izdavanje grantova koji ostaju važeći nakon F5; kada se osveži stranica memorijski token se gubi. Server-side grantovi treba da imaju TTL i mogućnost opoziva.
8. Proveriti pristup gostu pp32 i postojećim admin/lider funkcijama, kao i mobilne korisnike, pre merge.

## Redosled
- Pripremiti backend migraciju i testove RLS.
- Testirati na neprodukcijskom okruženju.
- Dodati UI za admin postavljanje šifara i modal za ulazak.
- Tek nakon testiranja primeniti migraciju i spojiti PR.
