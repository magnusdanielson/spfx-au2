import styles from '../HelloWorldWebPart.module.scss';
import {inject} from "aurelia";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as strings from 'HelloWorldWebPartStrings';
import { IHelloWorldWebPartProps } from '../HelloWorldWebPart';

@inject(Element, "WebPartContext","WebPartProperties")
export class HelloWorldMyComponent
{
    constructor(private element:Element, private context:WebPartContext, private properties:IHelloWorldWebPartProps )
    {
        element.addEventListener('build', (theme) => { this.onThemeChange(theme); }, false);
        this._environmentMessage = this._getEnvironmentMessage();
        this.imageUrl = this._isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png');
    }
    private _isDarkTheme: boolean = false;
    private _environmentMessage: string = '';
    private styles = styles;
    public message = 'Hello World!';
    private imageUrl;

    private _getEnvironmentMessage(): string {
        if (!!this.context.sdks.microsoftTeams) { // running in Teams
          return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
        }
    
        return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
      }

      private onThemeChange(currentThemeEvent)
      {
          var currentTheme = currentThemeEvent.detail;
        this._isDarkTheme = !!currentTheme.isInverted;
        const {
          semanticColors
        } = currentTheme;
        //@ts-ignore
        this.element.style.setProperty('--bodyText', semanticColors.bodyText);
        //@ts-ignore
        this.element.style.setProperty('--link', semanticColors.link);
        //@ts-ignore
        this.element.style.setProperty('--linkHovered', semanticColors.linkHovered);
      }
}
