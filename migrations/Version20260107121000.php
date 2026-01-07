<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260107121000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add last_activity column to user table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `user` ADD last_activity DATETIME DEFAULT NULL COMMENT "(DC2Type:datetime_immutable)"');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` DROP COLUMN last_activity');
    }
}
