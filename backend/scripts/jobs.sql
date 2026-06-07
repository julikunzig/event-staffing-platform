-- =====================================================
-- JOB TASKS
-- =====================================================

CREATE TABLE job_tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name VARCHAR(200) NOT NULL,
    endpoint_url VARCHAR(1000) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_tasks_active
    ON job_tasks(is_active);


-- =====================================================
-- JOB SCHEDULERS
-- =====================================================

CREATE TABLE job_schedulers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL
        CHECK (
            status IN (
                'ACTIVE',
                'PAUSED',
                'FINISHED',
                'ERROR'
            )
        ),
    interval_value INTEGER NOT NULL,
    interval_unit VARCHAR(20) NOT NULL
        CHECK (
            interval_unit IN (
                'MINUTES',
                'HOURS',
                'DAYS',
                'WEEKS',
                'MONTHS'
            )
        ),
    execution_days TEXT[],
    retry_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    retry_count INTEGER NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    last_execution_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT NOT NULL,

    CONSTRAINT fk_job_schedulers_task
        FOREIGN KEY (task_id)
        REFERENCES job_tasks(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX idx_job_schedulers_task
    ON job_schedulers(task_id);

CREATE INDEX idx_job_schedulers_status
    ON job_schedulers(status);



-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(300),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    notification_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, is_read)
    WHERE is_read = FALSE;

-- =====================================================
-- INBOX MESSAGES
-- =====================================================

CREATE TABLE inbox_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(300) NOT NULL,
    header TEXT,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    message_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_inbox_messages_user
    ON inbox_messages(user_id);

CREATE INDEX idx_inbox_messages_user_read
    ON inbox_messages(user_id, is_read);

CREATE INDEX idx_inbox_messages_date
    ON inbox_messages(message_date DESC);