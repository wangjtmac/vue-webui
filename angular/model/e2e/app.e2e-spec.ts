import { ModelPage } from './app.po';

describe('model App', function() {
  let page: ModelPage;

  beforeEach(() => {
    page = new ModelPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
