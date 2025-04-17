import { TestBed } from '@angular/core/testing';

import { SimplerecoderService } from './simplerecoder.service';

describe('SimplerecoderService', () => {
  let service: SimplerecoderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimplerecoderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
