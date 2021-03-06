import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

const by = webdriver.By;

export default class DevdocsDesignPage extends BaseContainer {
	constructor( driver, visit ) {
		const baseURL = 'https://wpcalypso.wordpress.com/devdocs';
		//const baseURL = 'http://calypso.localhost:3000/devdocs';

		super( driver, by.css( '.devdocs.main' ), visit, baseURL );

		// The devdocs page is transitioning to a new standard classname
		let oldClassName = '.design-assets__group';
		let newClassName = '.docs__design-assets-group';

		this.baseURL = baseURL;
		this.designElementSelector = by.css( `${oldClassName}, ${newClassName}` );
		this.designElementLinkSelector = by.css( `${oldClassName} h2 a:not(.button), ${newClassName} h2 a:not(.button)` );
		this.elementTitleSelector = by.css( '.header-cake__title' );
		this.elementButtonSelector = by.css( `div:not([style*="display:none"]):not([style*="display: none"]) > ${oldClassName} h2 a.button, div:not([style*="display:none"]):not([style*="display: none"]) > ${newClassName} h2 a.button` );
		this.allComponentsSelector = by.css( 'button.header-cake__back' );
	}

	compactAllElements() {
		const selector = '.design-assets__toggle.button';
		var driver = this.driver;

		var d = webdriver.promise.defer();

		driver.findElements( by.css( selector ) ).then( function( buttons ) {
			let promiseArray = [];

			for ( let i = 0; i < buttons.length; i++ ) {
				promiseArray.push( buttons[i].click() );
			}

			webdriver.promise.all( promiseArray ).then( function() {
				// Scroll back to the top of the page
				driver.executeScript( 'window.scrollTo( 0, 0 )' ).then( function() {
					d.fulfill( true );
				} );
			} );
		} );

		return d.promise;
	}

	openUIComponents() {
		var url = this.baseURL + '/design';

		return this.driver.get( url );
	}

	openTypography() {
		var url = this.baseURL + '/design/typography';

		return this.driver.get( url );
	}

	openAppComponents() {
		var url = this.baseURL + '/blocks';
		const driver = this.driver;

		return driver.get( url ).then( function() { // Refresh page to work around https://github.com/Automattic/wp-calypso/issues/7874
			return driver.navigate().refresh();
		} );
	}

	getAllDesignElements() {
		return this.driver.findElements( this.designElementSelector );
	}

	getAllDesignElementLinks() {
//		return this.driver.findElements( this.designElementLinkSelector );
		var hrefs = [];
		var d = webdriver.promise.defer();

		this.driver.findElements( this.designElementLinkSelector ).then( function( anchors ) {
			let promiseArray = [];
			for ( const a of anchors ) {
				promiseArray.push( a.getAttribute( 'href' ).then( function( href ) {
					hrefs.push( href );
				} ) );
			}

			webdriver.promise.all( promiseArray ).then( function() {
				d.fulfill( hrefs );
			} );
		} );

		return d.promise;
	}

	getCurrentElementTitle() {
		return this.driver.findElement( this.elementTitleSelector ).then( function( el ) {
			return el.getInnerHtml();
		} );
	}

	isCurrentElementCompactable() {
		return this.driver.isElementPresent( this.elementButtonSelector );
	}

	getCurrentElementCompactButton() {
		return this.driver.findElement( this.elementButtonSelector );
	}

	returnToAllComponents() {
		return this.driver.findElement( this.allComponentsSelector ).click();
	}

	hideMasterbar() {
		const driver = this.driver;
		return driver.isElementPresent( by.className( 'masterbar' ) ).then( function( present ) {
			if ( present ) {
				return driver.executeScript( 'document.querySelector( ".masterbar" ).style.visibility = "hidden";' );
			}
		} );
	}

	hideEnvironmentBadge() {
		return this.driver.executeScript( 'document.querySelector( ".environment-badge" ).style.visibility = "hidden";' );
	}
}
