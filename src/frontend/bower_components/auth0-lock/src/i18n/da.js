/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

// This file was automatically translated.
// Feel free to submit a PR if you find a more accurate translation.

export default {
  error: {
    forgotPassword: {
      too_many_requests:
        'Du har nået grænsen for forsøg på at skifte adgangskode. Vent venligst før du prøver igen.',
      'lock.fallback': 'Vi beklager, men der skete en fejl i forespørgslen efter ny adgangskode.'
    },
    login: {
      blocked_user: 'Denne bruger er blokeret.',
      invalid_user_password: 'Forkerte loginoplysninger.',
      'lock.fallback': 'Vi beklager, men der skete en fejl i forbindelse med login.',
      'lock.invalid_code': 'Forkert kode.',
      'lock.invalid_email_password': 'Forkert e-mail eller adgangskode.',
      'lock.invalid_username_password': 'Forkert brugernavn eller adgangskode.',
      'lock.network':
        'Vi kunne ikke få forbindelse til serveren. Kontroller venligst din forbindelse og prøv igen.',
      'lock.popup_closed': 'Popup-vinduet er lukket. Prøv venligst igen.',
      'lock.unauthorized': 'Tilladelse blev ikke givet. Prøv igen.',
      password_change_required:
        'Du skal opdatere din adgangskode, fordi det er første gang du logger på, eller fordi din adgangskode er udløbet.',
      password_leaked:
        'Dette login er blevet blokeret, fordi din adgangskode er blevet lækket på en anden hjemmeside. Vi har sendt dig en e-mail med instruktioner om, hvordan du fjerner blokeringen.',
      too_many_attempts: 'Din konto er blevet blokeret efter gentagne mislykkede loginforsøg.',
      'lock.mfa_registration_required':
        'Multifaktorgodkendelse er påkrævet, men din enhed er ikke tilmeldt. Tilmeld den venligst før du prøver igen.',
      'lock.mfa_invalid_code': 'Forkert kode. Prøv igen.',
      session_missing:
        'Kunne ikke fuldføre din godkendelsesanmodning. Prøv igen efter at have lukket alle åbne dialoger',
      'hrd.not_matching_email': 'Brug venligst din virksomheds-e-mail for at logge ind.'
    },
    passwordless: {
      'bad.email': 'Denne e-mail er ugyldig',
      'bad.phone_number': 'Dette telefonnummer er ugyldigt',
      'lock.fallback': 'Vi beklager, men der skete en fejl'
    },
    signUp: {
      invalid_password: 'Adgangskoden er ugyldigt',
      'lock.fallback': 'Vi beklager, men der skete en fejl, da du forsøgte at oprette dig.',
      password_dictionary_error: 'Adgangskoden er for almindelig.',
      password_no_user_info_error: 'Adgangskoden indeholder information om din bruger.',
      password_strength_error: 'Adgangskoden er for svag.',
      user_exists: 'Denne bruger eksisterer allerede.',
      username_exists: 'Dette brugernavn eksisterer allerede.'
    }
  },
  success: {
    logIn: 'Tak fordi du loggede ind.',
    forgotPassword: 'Vi har sendt den en e-mail med instruktioner til at nulstille dit kodeord.',
    magicLink: 'Vi har sendt dig et link, som du kan bruge til at logge ind<br />i %s.',
    signUp: 'Tak fordi du oprettede en bruger.'
  },
  blankErrorHint: 'Kan ikke være tom',
  codeInputPlaceholder: 'din kode',
  databaseEnterpriseLoginInstructions: '',
  databaseEnterpriseAlternativeLoginInstructions: 'eller',
  databaseSignUpInstructions: '',
  databaseAlternativeSignUpInstructions: 'eller',
  emailInputPlaceholder: 'dit@eksempel.dk',
  enterpriseLoginIntructions: 'Log ind med dit login til din virksomhed.',
  enterpriseActiveLoginInstructions: 'Indtast venligst dit login hos %s.',
  failedLabel: 'Mislykkede!',
  forgotPasswordAction: 'Har du glemt dit kodeord?',
  forgotPasswordInstructions:
    'Indtast venligst din e-mail, så sender vi instruktioner til at nulstille dit kodeord.',
  forgotPasswordSubmitLabel: 'Send e-mail',
  invalidErrorHint: 'Ugyldig',
  lastLoginInstructions: 'Sidste gang loggede du ind med',
  loginAtLabel: 'Log ind hos %s',
  loginLabel: 'Log Ind',
  loginSubmitLabel: 'Log Ind',
  loginWithLabel: 'Log ind med %s',
  notYourAccountAction: 'Er det ikke din konto?',
  passwordInputPlaceholder: 'dit kodeord',
  passwordStrength: {
    containsAtLeast: 'Skal indeholde mindst %d af de følgende %d typer af karakterer:',
    identicalChars:
      'Ikke mere end %d identiske karakterer efter hinanden (f.eks., "%s" er ikke tilladt)',
    nonEmpty: 'Ikke-tom adgangskode er påkrævet',
    numbers: 'Numre (f.eks. 0-9)',
    lengthAtLeast: 'Mindst %d karakterer langt',
    lowerCase: 'Små bogstaver (a-z)',
    shouldContain: 'Skal indeholde:',
    specialCharacters: 'Specialtegn (f.eks. !@#$%^&*)',
    upperCase: 'Store bogstaver (A-Z)'
  },
  passwordlessEmailAlternativeInstructions:
    'Ellers, indtast din e-mail for at logge ind<br/>eller oprette en konto',
  passwordlessEmailCodeInstructions: 'En e-mail med koden er sendt til %s.',
  passwordlessEmailInstructions: 'Indtast din e-mail for at logge ind<br/>eller oprette en konto',
  passwordlessSMSAlternativeInstructions:
    'Ellers, indtast dit telefonnummer for at logge ind<br/>eller oprette en konto',
  passwordlessSMSCodeInstructions: 'En SMS med koden er sendt<br/>til %s.',
  passwordlessSMSInstructions:
    'Indtast dit telefonnummer for at logge ind<br/>eller oprette en konto',
  phoneNumberInputPlaceholder: 'dit telefonnummer',
  resendCodeAction: 'Har du ikke modtaget koden?',
  resendLabel: 'Send igen',
  resendingLabel: 'Sender igen...',
  retryLabel: 'Prøv igen',
  sentLabel: 'Sendt!',
  signUpLabel: 'Opret dig',
  signUpSubmitLabel: 'Opret dig',
  signUpTerms: '',
  signUpWithLabel: 'Opret dig med %s',
  socialLoginInstructions: '',
  socialSignUpInstructions: '',
  ssoEnabled: 'Single Sign-On aktiveret',
  submitLabel: 'Send',
  unrecoverableError: 'Der skete en fejl.<br />Kontakt venligst den tekniske support.',
  usernameFormatErrorHint: 'Brug %d-%d bogstaver, tal og følgende tegn: "_", ".", "+", "-"',
  usernameInputPlaceholder: 'dit brugernavn',
  usernameOrEmailInputPlaceholder: 'brugernavn/e-mail',
  title: 'Auth0',
  welcome: 'Velkommen %s!',
  windowsAuthInstructions: 'Du er forbundet fra din virksomheds netværk&hellip;',
  windowsAuthLabel: 'Windows Authentication',
  forgotPasswordTitle: 'Nulstil din adgangskode',
  signupTitle: 'Tilmeld',
  mfaInputPlaceholder: 'Kode',
  mfaLoginTitle: 'Tofaktorgodkendelse',
  mfaLoginInstructions: 'Indtast venligst bekræftelseskoden genereret af din mobilapplikation.',
  mfaSubmitLabel: 'Log på',
  mfaCodeErrorHint: 'Brug %d tal',
  showPassword: 'Vis adgangskode'
};
