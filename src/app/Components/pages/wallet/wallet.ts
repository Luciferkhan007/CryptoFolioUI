import { Component, OnInit } from '@angular/core';


import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../../Material.Module';
import { WalletService } from '../../../Services/wallet-service';
import { error } from 'node:console';
import { CryptoService } from '../../../Services/CryptoService';
import { UiService } from '../../../Services/ui-service';

declare var Razorpay: any;

@Component({
  selector: 'app-wallet',
  imports: [MaterialModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss',
})
export class Wallet implements OnInit {
  userId = 0;

  balance = 0;
  transactions: any[] = [];
  loading = false;
  errorMessage = '';

  addAmount = 1000;
  deductAmount = 500;

  constructor(private walletService: WalletService, private crypto: CryptoService, private uiService: UiService) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.userId = this.getStoredUserId();

    if (this.userId <= 0) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.loadWalletData();
   
  }

  private getStoredUserId(): number {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }

    return Number(window.localStorage.getItem('userId')) || 0;
  }

  loadWalletData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.walletService.getBalance(this.userId).subscribe({
      next: (balanceRes) => {
        this.balance = balanceRes?.data || 0;
        console.log(balanceRes);
        

        this.walletService.getTransactions(this.userId).subscribe({
          next: (txRes) => {
            this.transactions = txRes?.data || [];
            console.log(txRes);
            
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Failed to load transactions';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load wallet balance';
        this.loading = false;
      }
    });
  }

  addMoney(): void {
    if (!this.addAmount || this.addAmount <= 0) {
      this.uiService.alert('Enter valid amount');
      return;
    }

    const payload = {
      userId: this.userId,
      amount: this.addAmount
    };

    this.walletService.createOrder(payload).subscribe({
      next: (res) => {
        const order = res?.data;
        this.openRazorpayCheckout(order);
      },
      error: (err) => {
        console.error(err);
        this.uiService.alert('Failed to create order');
      }
    });
  }

  openRazorpayCheckout(order: any): void {
    const options = {
      key: 'rzp_test_SROWrvojqfoawV',
      amount: order.amount,
      currency: order.currency,
      name: 'Crypto Wallet',
      description: 'Add Money to Wallet',
      order_id: order.orderId,
      handler: (response: any) => {
        const verifyPayload = {
          userId: this.userId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          amount: this.addAmount
        };

        this.walletService.verifyPayment(verifyPayload).subscribe({
          next: () => {
            this.uiService.alert('Money added successfully');
            this.loadWalletData();
          },
          error: (err) => {
            console.error(err);
            this.uiService.alert('Payment verification failed');
          }
        });
      },
      theme: {
        color: '#4f46e5'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  deductMoney(): void {
    if (!this.deductAmount || this.deductAmount <= 0) {
      this.uiService.alert('Enter valid amount');
      return;
    }

    const payload = {
      userId: this.userId,
      amount: this.deductAmount
    };

    this.walletService.deductBalance(payload).subscribe({
      next: () => {
        this.uiService.alert('Balance deducted');
        this.loadWalletData();
      },
      error: (err) => {
        console.error(err);
        this.uiService.alert('Failed to deduct balance');
      }
    });


  }

  async buyCoins(row: any): Promise<void> {
  console.log('Selected row:', row);

  const name = row.cryptoName;
  const amountText = await this.uiService.prompt(`Enter amount to buy ${name}`, '1000');

  if (!amountText) return;

  const amount = Number(amountText);

  if (isNaN(amount) || amount <= 0) {
    this.uiService.alert('Please enter a valid amount');
    return;
  }

  if (!row?.cryptoId) {
    this.uiService.alert('cryptoId is missing in this row');
    console.log('Invalid row:', row);
    return;
  }

  const payload = {
    userId: this.userId,
    cryptoId: row.cryptoId,
    amount: amount
  };

  this.walletService.buycoin(payload).subscribe({
    next: () => {
      this.uiService.alert(`${name} bought successfully`);
      this.loadWalletData();
    },
    error: (err) => {
      console.error(err);
      this.uiService.alert(err?.error?.message || 'Buy failed');
    }
  });
  }

  
  async sellcoins( coin: any) : Promise<void>{
    var quantity = coin.quantity;
    var coinQuantity  = await this.uiService.prompt(`Enter the Quantity to sell ${quantity}`)
   
   const quantityText = Number(coinQuantity)
    const sellPayload = { 
    userId: this.userId,
     cryptoId: coin.cryptoId,
    quantity: quantityText
    }

    this.walletService.sellCoins(sellPayload).subscribe({
      next : (res) =>{
        console.log('Quantity', res);
        
        this.uiService.alert(`${quantityText} sell successfully`);
      },

      error: (err) => {
        console.error(err.error || 'Failed to Sell');
        
      },
    })
  }

}