import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TorusWallet } from '../../../../services/wallet/wallet';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { DropdownComponent } from '../dropdown.component';

@Component({
  selector: 'app-ui-dropdown-permission-request',
  templateUrl: './permission-request.component.html',
  styleUrls: ['../../../../../scss/components/ui/dropdown/account-dropdown.component.scss']
})
export class PermissionRequestDropdownComponent extends DropdownComponent implements OnInit, OnChanges {
  constructor(public router: Router, public lookupService: LookupService, private walletService: WalletService) {
    super();
  }

  ngOnInit(): void {
    this.selection = this.current;
    this.list = this.options;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options && changes.options.currentValue !== changes.options.previousValue) {
      this.list = this.options;
    }
  }

  getUsername(address: string): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName();
    } else {
      const party = this.lookupService.resolve({
        address: address || this.current?.address
      });
      if (party?.name) {
        return party.name;
      }
    }
    return '';
  }
  getVerifier(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.verifier;
    } else {
      return 'domain';
    }
  }

  toggleDropdown(): void {
    this.dropdownResponse.emit(this.selection);
    this.isOpen = !this.isOpen;
  }
}
