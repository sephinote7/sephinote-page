"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { AdminLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  Icon,
  Input,
  Textarea,
  Label,
  Avatar,
  Divider,
  Alert,
} from "@/components/ui";
import type { Profile } from "@/types";

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/admin/login");
        return;
      }

      setEmail(user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || "");
        setBio(profileData.bio || "");
        setAvatarUrl(profileData.avatar_url);
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsUploading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // 기존 아바타 삭제
    if (avatarUrl) {
      const oldPath = avatarUrl.split("/avatars/")[1];
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    // 새 아바타 업로드
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setError("이미지 업로드에 실패했습니다: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setIsUploading(false);

    if (updateError) {
      setError("프로필 업데이트에 실패했습니다.");
      return;
    }

    setAvatarUrl(publicUrl);
    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    showSuccessAlert("프로필 사진이 변경되었습니다.");
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setIsUploading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const oldPath = avatarUrl.split("/avatars/")[1];
    if (oldPath) {
      await supabase.storage.from("avatars").remove([oldPath]);
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setIsUploading(false);

    if (updateError) {
      setError("프로필 업데이트에 실패했습니다.");
      return;
    }

    setAvatarUrl(null);
    setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
    showSuccessAlert("프로필 사진이 삭제되었습니다.");
  };

  const showSuccessAlert = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    showSuccessAlert("프로필이 저장되었습니다.");
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsChangingPassword(true);

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsChangingPassword(false);

    if (passwordError) {
      setError(passwordError.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    showSuccessAlert("비밀번호가 변경되었습니다.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            프로필 및 계정 설정을 관리합니다.
          </p>
        </div>

        {showSuccess && (
          <Alert
            variant="success"
            title="완료"
            description={successMessage}
            className="mb-6"
          />
        )}

        {error && (
          <Alert
            variant="danger"
            title="오류"
            description={error}
            className="mb-6"
          />
        )}

        <Grid cols={1} colsLg={3} gap="lg">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                  Profile Settings
                </h2>
                <form onSubmit={handleSaveProfile}>
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div>
                      <Label className="mb-3">Profile Picture</Label>
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                            className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt="Profile"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Icon name="person" size="xl" className="text-zinc-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Icon name="plus" size="lg" className="text-white" />
                            </div>
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                              </div>
                            )}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </div>
                        <div className="flex-1">
                          <Stack gap="sm">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAvatarClick}
                              disabled={isUploading}
                            >
                              사진 변경
                            </Button>
                            {avatarUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveAvatar}
                                disabled={isUploading}
                                className="text-red-600 hover:text-red-700"
                              >
                                사진 삭제
                              </Button>
                            )}
                            <p className="text-xs text-zinc-400">
                              JPG, PNG, GIF (최대 5MB)
                            </p>
                          </Stack>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Username */}
                    <div>
                      <Label htmlFor="username" className="mb-2">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="사용자 이름"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio" className="mb-2">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="자기소개를 입력하세요"
                        rows={4}
                      />
                      <p className="text-xs text-zinc-400 mt-1">
                        홈페이지에 표시되는 소개글입니다.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSaving}
                      isLoading={isSaving}
                      leftIcon={<Icon name="check" size="sm" />}
                    >
                      {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                  Account Settings
                </h2>
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-zinc-50 dark:bg-zinc-800"
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      이메일은 변경할 수 없습니다.
                    </p>
                  </div>

                  <Divider />

                  {/* Change Password */}
                  <form onSubmit={handleChangePassword}>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword" className="mb-2">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="새 비밀번호 (최소 6자)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="mb-2">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="새 비밀번호 확인"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={!newPassword || !confirmPassword || isChangingPassword}
                        isLoading={isChangingPassword}
                      >
                        Change Password
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardContent>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                  Profile Preview
                </h3>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon name="person" size="xl" className="text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {username || "Username"}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    {bio || "자기소개가 없습니다."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card>
              <CardContent>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Session
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  현재 로그인된 계정에서 로그아웃합니다.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                  leftIcon={<Icon name="arrow-left" size="sm" />}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </div>
    </AdminLayout>
  );
}
