"use client";

import { useEffect, useState } from "react";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { PATH_AUTHENTICATIONS } from "@/routes";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [shouldRedirect, setShouldRedirect] = useState(true);
  const router = useRouter();
  const { resetAuthorizations } = useAuthorizations();
  const { resetInstitution } = useInstitution();

  const handleLogout = async () => {
    try {
      await fetchJson(await internalApiUrl(`/api/auth/logout`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      notifications.show({
        color: "green",
        title: "Deconnexion reussie.",
        message: "Vous allez être redirigé vers la page de login",
      });
      resetAuthorizations();
      resetInstitution();
      router.push(PATH_AUTHENTICATIONS.login);
    } catch (error) {
      console.error("Logout error:", error);
      // If logout fails, just redirect to login
      router.push(PATH_AUTHENTICATIONS.login);
    }
  };

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldRedirect]);

  return (
    <Container>
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Title>Une erreur est survenue</Title>
        <Text size="lg" mt="md">
          {error.message || "Une erreur inattendue s'est produite."}
        </Text>
        <Group justify="center" mt="xl">
          <Button onClick={() => setShouldRedirect(false)} variant="outline">
            Rester sur la page
          </Button>
          <Button onClick={() => reset()}>Réessayer</Button>
          {shouldRedirect && (
            <Text size="sm" c="dimmed">
              Redirection dans {timeLeft} secondes...
            </Text>
          )}
        </Group>
      </div>
    </Container>
  );
} 