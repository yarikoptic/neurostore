/// <reference types="cypress" />

export {};

const PATH = '/userstudysets';
const PAGE_NAME = 'UserStudysetsPage';

describe(PAGE_NAME, () => {
    beforeEach(() => {
        cy.clearLocalStorage().clearSessionStorage();
        cy.intercept('GET', 'https://api.appzi.io/**', { fixture: 'appzi' }).as('appziFixture');
    });

    it('should load successfully', () => {
        cy.intercept('GET', `**/api/studysets/**`).as('realUserStudysetsRequest');
        cy.login('real')
            .wait('@realUserStudysetsRequest')
            .visit(PATH)
            .wait('@realUserStudysetsRequest');
    });

    it('should redirect if the user is not authenticated', () => {
        cy.intercept('GET', `**/api/studysets/**`, { fixture: 'userStudysets' });
        cy.visit(PATH)
            .url()
            .should('be.equal', `${Cypress.config('baseUrl')}/studysets`);
    });

    describe('Tour ', () => {
        beforeEach(() => {
            cy.intercept('GET', `**/api/studysets/**`, { fixture: 'userStudysets' }).as(
                'userStudysetsRequest'
            );
        });

        it('should open immediately if it is the users first time logging in', () => {
            cy.login('mocked', { 'https://neurosynth-compose/loginsCount': 1 })
                .visit(PATH)
                .wait(['@userStudysetsRequest', '@userStudysetsRequest'])
                .get('.reactour__popover')
                .should('exist')
                .and('be.visible');
        });

        it('should not open immediately if it is not the first time logging in', () => {
            cy.login('mocked', { 'https://neurosynth-compose/loginsCount': 2 })
                .visit(PATH)
                .wait(['@userStudysetsRequest', '@userStudysetsRequest'])
                .get('.reactour__popover')
                .should('not.exist');
        });

        it('should open when the button is clicked', () => {
            cy.login('mocked', { 'https://neurosynth-compose/loginsCount': 2 })
                .visit(PATH)
                .wait(['@userStudysetsRequest', '@userStudysetsRequest'])
                .get('[data-testid="HelpIcon"]')
                .click()
                .get('.reactour__popover')
                .should('exist')
                .and('be.visible');
        });

        it('should not open if its the first time logging in but the page has been seen already', () => {
            cy.login('mocked', { 'https://neurosynth-compose/loginsCount': 1 })
                .get('body')
                .click(0, 0)
                .addToLocalStorage(`hasSeen${PAGE_NAME}`, 'true')
                .visit(PATH)
                .wait(['@userStudysetsRequest', '@userStudysetsRequest'])
                .get('.reactour__popover')
                .should('not.exist');
        });

        it('should close when clicked out', () => {
            // 1. ARRANGE
            cy.login('mocked', { 'https://neurosynth-compose/loginsCount': 2 })
                .visit(PATH)
                .wait(['@userStudysetsRequest', '@userStudysetsRequest'])
                .get('[data-testid="HelpIcon"]')
                .click()
                .get('body')
                .click(0, 0)
                .get('.reactour__popover')
                .should('not.exist');
        });

        it('should close when the close button is clicked', () => {
            cy.login('mocked', { 'https://neurosynth-compose/loginsCount': 2 })
                .visit(PATH)
                .wait(['@userStudysetsRequest', '@userStudysetsRequest'])
                .get('[data-testid="HelpIcon"]')
                .click()
                .get('[aria-label="Close Tour"]')
                .click()
                .get('.react__popover')
                .should('not.exist');
        });
    });
});
