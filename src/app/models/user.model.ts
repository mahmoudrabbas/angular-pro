export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  isConfirmed: boolean;
  role: 'customer' | 'admin';
  address?: string;
  createdAt?: string; // Added by { timestamps: true }
  updatedAt?: string; // Added by { timestamps: true }
}
