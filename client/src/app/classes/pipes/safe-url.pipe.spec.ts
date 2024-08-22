import { DomSanitizer } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url-pipe';

describe('SafeUrlPipe', () => {
    let pipe: SafeUrlPipe;
    let domSanitizerSpy: jasmine.SpyObj<DomSanitizer>;

    beforeEach(async () => {
        domSanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
        pipe = new SafeUrlPipe(domSanitizerSpy);
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should call bypassSecurityTrustResourceUrl', () => {
        pipe.transform('');
        expect(domSanitizerSpy.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
    });
});
