<?php
// src/Twig/AppExtension.php

namespace App\Twig;

use App\Entity\User;
use App\Entity\Notification;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AppExtension extends AbstractExtension
{
    private $entityManager;


    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getTotalUsers', [$this, 'getTotalUsers']),
            new TwigFunction('getAllNotificationsCount', [$this, 'getAllNotificationsCount']),
            new TwigFunction('getUnreadMessagesCount', [$this, 'getUnreadMessagesCount']),
            new TwigFunction('getActiveCommunityUsers', [$this, 'getActiveCommunityUsers']),
        ];
    }

    public function getTotalUsers(): int
    {
        try {
            $userRepository = $this->entityManager->getRepository(User::class);
            $total = $userRepository->count([]);

            // Log pour debug (vous pouvez retirer plus tard)
            // error_log("Nombre total d'utilisateurs : " . $total);

            return $total;
        } catch (\Exception $e) {
            // En cas d'erreur, retourner 0 pour éviter de casser l'affichage
            error_log("Erreur dans AppExtension::getTotalUsers: " . $e->getMessage());
            return 0;
        }
    }

    // message unread count function
    public function getUnreadMessagesCount(?User $user = null): int
    {
        if (!$user) {
            return 0;
        }

        try {
            $messageRepository = $this->entityManager->getRepository(Message::class);
            return (int) $messageRepository->createQueryBuilder('m')
                ->select('COUNT(m.id)')
                ->where('m.receiver = :user')
                ->andWhere('m.isRead = false')
                ->setParameter('user', $user)
                ->getQuery()
                ->getSingleScalarResult();
        } catch (\Exception $e) {
            error_log("Erreur dans AppExtension::getUnreadMessagesCount: " . $e->getMessage());
            return 0;
        }
    }

    // renvoie les utilisateurs actifs (dernière activité dans les X minutes)
    public function getActiveCommunityUsers(?User $user = null, int $minutes = 5): array
    {
        try {
            $threshold = new \DateTimeImmutable(sprintf('-%d minutes', $minutes));
            $qb = $this->entityManager->createQueryBuilder();
            $qb->select('u')
                ->from(User::class, 'u')
                ->where('u.lastActivity IS NOT NULL')
                ->andWhere('u.lastActivity >= :threshold')
                ->setParameter('threshold', $threshold)
                ->orderBy('u.lastActivity', 'DESC')
                ->setMaxResults(12);

            return $qb->getQuery()->getResult();
        } catch (\Exception $e) {
            error_log('Erreur getActiveCommunityUsers: ' . $e->getMessage());
            return [];
        }
    }




    //notification badge function
    public function getAllNotificationsCount(?User $user = null): int
    {
        // Si pas d'utilisateur connecté, retourner 0
        if (!$user) {
            return 0;
        }

        try {
            $notificationRepository = $this->entityManager->getRepository(Notification::class);
            return $notificationRepository->createQueryBuilder('n')
                ->select('COUNT(n.id)')
                ->where('n.user = :user')
                ->setParameter('user', $user)
                ->getQuery()
                ->getSingleScalarResult();
        } catch (\Exception $e) {
            error_log("Erreur dans AppExtension::getAllNotificationsCount: " . $e->getMessage());
            return 0;
        }
    }
}
