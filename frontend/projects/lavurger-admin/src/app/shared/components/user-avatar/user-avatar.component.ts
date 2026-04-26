import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="colorClass"
      class="rounded-full text-white font-bold flex items-center justify-center shrink-0 transition-colors"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.fontSize.px]="size * 0.4"
    >
      {{ initials }}
    </div>
  `,
})
export class UserAvatarComponent implements OnChanges {
  @Input() name: string = '';
  @Input() role: string = '';
  @Input() isActive: boolean = true;
  @Input() size: number = 32;

  initials: string = '';
  colorClass: string = 'bg-gray-500';

  ngOnChanges() {
    this.initials = this.getInitials(this.name);
    this.setColor();
  }

  private getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private setColor() {
    if (!this.isActive) {
      this.colorClass = 'bg-[#E2E8F0] !text-[#64748B]';
      return;
    }

    switch (this.role) {
      case 'ADMIN':
        this.colorClass = 'bg-[#0F172A]';
        break;
      case 'MANAGER':
        this.colorClass = 'bg-purple-600';
        break;
      case 'KITCHEN':
        this.colorClass = 'bg-[#E1F3E5] !text-[#046030]';
        break;
      case 'CASHIER':
        this.colorClass = 'bg-admin-blue-lt !text-admin-blue';
        break;
      default:
        this.colorClass = 'bg-gray-500';
    }
  }
}
