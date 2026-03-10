import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class Addresses implements OnInit {
  addresses = signal<Address[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = signal({
    label: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    country: '',
    isDefault: false,
  });

  labels = ['Home', 'Work', 'Other'];

  ngOnInit() {
    // Load from localStorage as mock persistence
    const saved = localStorage.getItem('addresses');
    if (saved) this.addresses.set(JSON.parse(saved));
  }

  save() {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    const f = this.form();
    if (!f.fullName || !f.street || !f.city || !f.country) return;

    const editId = this.editingId();
    if (editId) {
      // update
      this.addresses.update((list) =>
        list.map((a) => (a.id === editId ? { ...f, id: editId } : a)),
      );
    } else {
      // add
      const newAddr: Address = { ...f, id: Date.now().toString() };
      if (newAddr.isDefault) {
        this.addresses.update((list) => list.map((a) => ({ ...a, isDefault: false })));
      }
      this.addresses.update((list) => [...list, newAddr]);
    }

    localStorage.setItem('addresses', JSON.stringify(this.addresses()));
    this.cancelForm();
  }

  edit(addr: Address) {
    this.form.set({ ...addr });
    this.editingId.set(addr.id);
    this.showForm.set(true);
  }

  delete(id: string) {
    this.addresses.update((list) => list.filter((a) => a.id !== id));
    localStorage.setItem('addresses', JSON.stringify(this.addresses()));
  }

  setDefault(id: string) {
    this.addresses.update((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));
    localStorage.setItem('addresses', JSON.stringify(this.addresses()));
  }

  openForm() {
    this.form.set({
      label: 'Home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      country: '',
      isDefault: false,
    });
    this.editingId.set(null);
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  updateForm(field: string, value: any) {
    this.form.update((f) => ({ ...f, [field]: value }));
  }
}
