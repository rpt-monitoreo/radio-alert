import { Injectable } from '@nestjs/common';
import { Builder, By, until, WebDriverWait } from 'selenium-webdriver';
import * as firefox from 'selenium-webdriver/firefox';

@Injectable()
export class AppService {
  async getData(): Promise<{ message: string }> {
    return { message: 'Hello API 1' };
    // Set the path to the Firefox profile directory
    const profilePath =
      'C:/Users/juanb/AppData/Roaming/Mozilla/Firefox/Profiles/7dc6a3mu.bing';

    // Create a new Firefox profile
    const profile = new firefox.Profile(profilePath);

    // Create a new Firefox options object
    const options = new firefox.Options();

    // Set the headless option to false
    options.headless(false);

    // Create a new Firefox driver with the profile and options
    const driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .setFirefoxProfile(profile)
      .build();

    // Navigate to the webpage
    await driver.get(
      'https://www.bing.com/search?q=Bing+AI&showconv=1&FORM=hpcodx'
    );

    const wait = await new WebDriverWait(driver, 10);
    await wait.until(
      until.ExpectedConditions.presenceOfElementLocated(By.tagName('body'))
    );

    // Wait for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Close the Firefox driver
    await driver.quit();
    return { message: 'Hello API 1' };
  }
}
