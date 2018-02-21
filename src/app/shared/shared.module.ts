import { NgModule } from '@angular/core';
import { DropdownDirective } from './dropdown.directive';
import { DocPipe } from './pipes/docpipe.pipe';

@NgModule({
    imports: [],
    exports: [
        DropdownDirective,
        DocPipe
    ],
    declarations: [DropdownDirective, DocPipe],
    providers: []
  })
export class SharedModule {}
