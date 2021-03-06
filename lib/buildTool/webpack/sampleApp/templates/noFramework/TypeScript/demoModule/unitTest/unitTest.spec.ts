import demoModule from '../demoModule';

describe('Basic unit test', () => {

  let adder = function (x, y) {
    return x + y;
  };

  it('should add two numbers together', function () {
    expect(adder(2, 3)).toEqual(5);
  });
});


describe('Test imported module', function () {
  it('should have a demoModule with a gotoPage method', () => {
    expect(typeof demoModule.gotoPage).toEqual('function');
  });

  it('should only update the HTML when gotoPage(page, false) is called', () => {
    let documentState = {
      innerHTML: ''
    };
    let mockWin = {
      document: {
        getElementById: function() {
          return documentState;
        }
      },
      page1: 'page 1 html'
    };
    demoModule.setWindow(mockWin);

    demoModule.gotoPage('#/page1', false);
    expect(mockWin.document.getElementById().innerHTML).toEqual('page 1 html');
  });


  it('should update HTML and call history.pushState when gotoPage(page, true) is called', () => {
    let documentState = {
      innerHTML: ''
    };
    let mockWin = {
      document: {
        getElementById: function() {
          return documentState;
        }
      },
      page1: 'page 1 html',
      history: {
        pushState: jasmine.createSpy('pushState')
      }
    };
    demoModule.setWindow(mockWin);

    demoModule.gotoPage('#/page1', true);
    expect(mockWin.document.getElementById().innerHTML).toEqual('page 1 html');
    expect(mockWin.history.pushState).toHaveBeenCalledWith({ isPushState: true, url: '#/#/page1' }, '#/page1', '#/#/page1');
  });


  it('should create an onpopstate handler on the window object which calls gotoPage() when the event is a pushState event', function() {
    let mockWin = {};
    demoModule.setWindow(mockWin);
    expect(typeof (<any>mockWin).onpopstate).toEqual('function');
    spyOn(demoModule, 'gotoPage').and.stub();

    (<any>mockWin).onpopstate({
      state: {
        isPushState: true,
        url: 'abc'
      }
    });

    expect(demoModule.gotoPage).toHaveBeenCalledWith('abc', false);
  });

  it('should not call gotoPage() when the event is not a pushState event', function() {
    let mockWin = {};
    demoModule.setWindow(mockWin);
    expect(typeof (<any>mockWin).onpopstate).toEqual('function');

    spyOn(demoModule, 'gotoPage').and.stub();
    (<any>mockWin).onpopstate({
      state: {
        isPushState: false,
        url: 'abc'
      }
    });

    expect(demoModule.gotoPage).not.toHaveBeenCalled();
  });
});
