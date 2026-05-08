const GQL = 'https://cms.trial-task.k8s.ext.fcse.io/graphql';

function stubLogin() {
  cy.intercept('POST', GQL, (req) => {
    if (req.body?.operationName === 'Login') {
      req.reply({ data: { login: { jwt: 'fake-jwt' } } });
    }
  }).as('login');
}

function stubUser() {
  cy.intercept('POST', GQL, (req) => {
    if (req.body?.operationName === 'User') {
      req.reply({
        data: {
          user: { id: '2', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
        },
      });
    }
  }).as('user');
}

function login() {
  stubLogin();
  stubUser();
  cy.visit('/login');
  cy.get('#identifier').type('user@example.com');
  cy.get('#password').type('password123');
  cy.get('button[type="submit"]').click();
  cy.wait('@login');
}

describe('auth guard', () => {
  it('redirects unauthenticated user from /profile to /login', () => {
    cy.visit('/profile');
    cy.url().should('include', '/login');
    cy.get('h1').should('contain.text', 'Sign in');
  });
});

describe('login form validation', () => {
  beforeEach(() => cy.visit('/login'));

  it('submit button is disabled after failed validation', () => {
    cy.get('button[type="submit"]').should('not.be.disabled');

    cy.get('#identifier').type('not-an-email');
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]').should('be.disabled');
  });
});

describe('profile page', () => {
  beforeEach(() => login());

  it('shows all required fields with data', () => {
    cy.url().should('include', '/profile');

    cy.contains('label', /first name/i).should('be.visible');
    cy.contains('label', /last name/i).should('be.visible');

    cy.get('input[value="John"]').should('exist');
    cy.get('input[value="Doe"]').should('exist');
  });

  it('logout button redirects to login page', () => {
    cy.get('button').contains(/log out/i).click();

    cy.url().should('include', '/login');
    cy.get('h1').should('contain.text', 'Sign in');
  });
});
