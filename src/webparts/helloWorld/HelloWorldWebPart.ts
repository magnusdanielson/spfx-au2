import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
  ISemanticColors } from '@microsoft/sp-component-base';
import { escape } from '@microsoft/sp-lodash-subset';
import Aurelia from 'aurelia';
import { DI, Registration } from 'aurelia';
import { HelloWorldMyComponent } from './components/hello-world-my-component';
import { HelloWorldOtherStuff } from './components/hello-world-other-stuff';
//import { MoreStuff } from './components/hello-world-more-stuff';
import styles from './HelloWorldWebPart.module.scss';
//import * as strings from 'HelloWorldWebPartStrings';

export interface IHelloWorldWebPartProps {
  description: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  private element;
  private tempTheme: IReadonlyTheme | undefined;

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    
    console.log("onThemeChanged");
    if (!currentTheme) {
      return;
    }

    this.tempTheme = currentTheme;

    if(typeof this.element !== "undefined")
    {
      const event = new CustomEvent('build', { detail: currentTheme });
      this.element.dispatchEvent(event);
    }
  }
  protected onInit(): Promise<void> {

    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();

    // Assign theme slots
    if (this._themeVariant) {

      // output all theme theme variants
      console.log("LOG Theme variant:::", this._themeVariant);

      // transfer semanticColors into CSS variables
      this.setCSSVariables(this._themeVariant.semanticColors);

      // transfer fonts into CSS variables
      this.setCSSVariables(this._themeVariant.fonts);

      // transfer color palette into CSS variables
      this.setCSSVariables(this._themeVariant.palette);

      // transfer color palette into CSS variables
      this.setCSSVariables(this._themeVariant["effects"]);

    } else {

      // Fallback to core theme state options applicable for Single Canvas Apps and Microsoft Teams
      this.setCSSVariables(window["__themeState__"].theme)

    }

    // Register a handler to be notified if the theme variant changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

    return super.onInit();
  }

  // Handle all theme changes
  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    console.log("_handleThemeChangedEvent");
    this._themeVariant = args.theme;
  }

  /// Converts JSON Theme Slots it CSS variables
  private setCSSVariables(theming: any) {

    // request all key defined in theming
    let themingKeys = Object.keys(theming);
    // if we have the key
    if (themingKeys !== null) {
      // loop over it
      themingKeys.forEach(key => {
        // add CSS variable to style property of the web part
        this.domElement.style.setProperty(`--${key}`, theming[key])

      });

    }

  }

  public async render() {
    // This line renders the html on the page
    this.domElement.innerHTML = `<hello-world-my-component class="${styles.helloWorld}"></hello-world-my-component>`;

    try {

      var au = new Aurelia();
      const rootContainer = au.container;
      rootContainer.register(
        Registration.instance("WebPartContext", this.context),
        Registration.instance("WebPartProperties", this.properties)
      );
      this.element = document.getElementsByClassName(styles.helloWorld)[0];

      await au.register(<any>HelloWorldMyComponent)
        .register(<any>HelloWorldOtherStuff)
      //  .register(<any>HelloWorldMoreStuff)
        .app({
          component: HelloWorldMyComponent,
          host: this.element
        })
        .start();

        if(typeof this.tempTheme !== "undefined")
    {
      const event = new CustomEvent('build', { detail: this.tempTheme });
      this.element.dispatchEvent(event);
    }
    }
    catch (error) {
      console.log(error);
    }
  }


  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "PropertyPaneDescription"
          },
          groups: [
            {
              groupName: "BasicGroupName",
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "DescriptionFieldLabel"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
