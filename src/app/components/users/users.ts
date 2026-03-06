import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
})
export class Users implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  limit = 10;

  // Search
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Modal state
  showEditModal = false;
  showDeleteModal = false;
  selectedUser: User | null = null;
  modalLoading = false;
  modalError: string | null = null;

  editForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initEditForm();
    this.setupSearch();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initEditForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      // email intentionally excluded — changing email requires re-verification
      phone: [''],
      address: [''],
    });
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query;
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.userService
      .getAllUsers(this.currentPage, this.limit, this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.totalPages = res.pages;
          this.totalUsers = res.UsersNumber;
          this.loading = false;

          // Force change detection so the template updates immediately
          this.cd.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load users.';
          this.loading = false;

          // update view
          this.cd.detectChanges();
        },
      });
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  get pages(): number[] {
    const range: number[] = [];
    const delta = 2;
    for (
      let i = Math.max(1, this.currentPage - delta);
      i <= Math.min(this.totalPages, this.currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }

  // ─── Edit Modal ───────────────────────────────────────────────────────────────

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.editForm.patchValue({
      name: user.name,
      // email not patched — it is displayed as read-only in the template
      phone: user.phone || '',
      address: user.address || '',
    });
    this.modalError = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editForm.reset();
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.selectedUser) return;
    const user = this.selectedUser;
    this.modalLoading = true;
    this.modalError = null;

    this.userService
      .updateUser(user._id, this.editForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const idx = this.users.findIndex((u) => u._id === res.user._id);
          if (idx !== -1) this.users[idx] = res.user;
          this.modalLoading = false;
          this.closeEditModal();
          this.showSuccess('User updated successfully.');

          // update view
          this.cd.detectChanges();
        },
        error: (err) => {
          this.modalError = err.error?.message || 'Update failed.';
          this.modalLoading = false;
          this.cd.detectChanges();
        },
      });
  }

  // ─── Delete Modal ─────────────────────────────────────────────────────────────

  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.modalError = null;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;
    const user = this.selectedUser;
    this.modalLoading = true;
    this.modalError = null;

    this.userService
      .deleteUser(user._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter((u) => u._id !== user._id);
          this.totalUsers--;
          this.modalLoading = false;
          this.closeDeleteModal();
          this.showSuccess('User deleted successfully.');

          // if page is now empty, load previous page (this will also detect)
          if (this.users.length === 0 && this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
          } else {
            this.cd.detectChanges();
          }
        },
        error: (err) => {
          this.modalError = err.error?.message || 'Delete failed.';
          this.modalLoading = false;
          this.cd.detectChanges();
        },
      });
  }

  // ─── Role Toggle ──────────────────────────────────────────────────────────────

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    this.userService
      .changeUserRole(user._id, { role: newRole })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const idx = this.users.findIndex((u) => u._id === res.user._id);
          if (idx !== -1) this.users[idx] = res.user;
          this.showSuccess(`Role changed to ${newRole}.`);
          this.cd.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.message || 'Role change failed.';
          this.cd.detectChanges();
        },
      });
  }

  // ─── Utility ──────────────────────────────────────────────────────────────────

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 3500);
  }

  trackByUser(_: number, user: User): string {
    return user._id;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  }
}
