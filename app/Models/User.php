<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;
use App\Enums\UserRole;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role',
        'name',
        'email',
        'phone',
        'password',
        'profile_image',
    ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $dates = ['deleted_at'];
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    protected $casts = [
        'role' => UserRole::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship to teacher/student profiles
    public function teacherProfile()
    {
        return $this->hasOne(Teacher::class);
    }

    public function studentProfile()
    {
        return $this->hasOne(Student::class);
    }

    // Checkers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'student_id');
    }




    // public function notifications(): HasMany
    // {
    //     return $this->hasMany(Notification::class);
    // }

    // public function payments(): HasMany
    // {
    //     return $this->hasMany(Payment::class, 'created_by');
    // }

    // public function files(): HasMany
    // {
    //     return $this->hasMany(FileEntry::class);
    // }

    // public function auditLogs(): HasMany
    // {
    //     return $this->hasMany(AuditLog::class);
    // }

}
