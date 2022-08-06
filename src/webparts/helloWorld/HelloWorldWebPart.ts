import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
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

  private element;
  private tempTheme: IReadonlyTheme | undefined;

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    
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

    return super.onInit();
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
