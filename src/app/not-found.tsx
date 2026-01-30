"use client";

import { useEffect, useState } from "react";
import { Button, Container, Group, Text, Title, Image } from "@mantine/core";
import { useRouter } from "next/navigation";
import { PATH_AUTHENTICATIONS } from "@/routes";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";

export default function NotFound() {
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
        <Title>404 - Page Non Trouvée</Title>
        <Image
          src="/404.svg"
          alt="404"
          style={{ 
            width: '300px', 
            height: '300px',
            margin: '20px auto' 
          }}
        />
        <Text size="lg" mt="md">
          Désolé, la page que vous recherchez n'existe pas.
        </Text>
        <Group justify="center" mt="xl">
          <Button onClick={() => setShouldRedirect(false)} variant="outline">
            Rester sur la page
          </Button>
          <Button onClick={() => router.back()}>Retour</Button>
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